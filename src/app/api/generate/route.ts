import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { validatePrompt } from "@/lib/moderation/promptFilter";
import { defaultOutputClassifier } from "@/lib/moderation/outputClassifier";
import { getGenerationProvider } from "@/lib/generation/providers";
import { AspectRatio, StylePreset } from "@/lib/generation/types";
import { z } from "zod";

const generateSchema = z.object({
  characterId: z.string().optional().nullable(),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(2000),
  negativePrompt: z.string().max(1000).optional(),
  stylePreset: z.enum(["realistic", "anime", "3d", "illustration"]).default("realistic"),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("1:1"),
  seed: z.number().int().optional(),
  numOutputs: z.number().int().min(1).max(4).default(1),
  videoDuration: z.number().min(2).max(10).optional(),
  motionStrength: z.number().min(0.1).max(1.0).optional(),
  resolution: z.string().default("1024x1024"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: `Account suspended. Reason: ${user.banReason || "Policy violation"}` },
        { status: 403 }
      );
    }

    // 1. HARD COMPLIANCE GATE: Real Age Verification Required
    if (!user.isAgeVerified) {
      return NextResponse.json(
        {
          error: "18+ Identity verification required before generating content. Please verify your age in Account Settings.",
          code: "KYC_REQUIRED",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid generation parameters" },
        { status: 400 }
      );
    }

    const params = parsed.data;

    // Calculate credit cost
    const costCredits = params.type === "VIDEO" ? 10 : 2 * params.numOutputs;

    if (user.creditBalance < costCredits) {
      return NextResponse.json(
        {
          error: `Insufficient credits. This generation requires ${costCredits} credits, but you have ${user.creditBalance}.`,
          code: "INSUFFICIENT_CREDITS",
          required: costCredits,
          available: user.creditBalance,
        },
        { status: 402 }
      );
    }

    // Load Character if specified (for consistent face/seed/style conditioning)
    let characterPromptPrefix = "";
    let effectiveSeed = params.seed ?? Math.floor(Math.random() * 900000) + 100000;
    let selectedCharacter = null;

    if (params.characterId) {
      selectedCharacter = await prisma.character.findFirst({
        where: { id: params.characterId, userId: user.id },
      });

      if (selectedCharacter) {
        // Enforce apparent age >= 18
        if (selectedCharacter.apparentAge < 18) {
          return NextResponse.json(
            { error: "Character does not meet statutory minimum age requirements." },
            { status: 400 }
          );
        }

        characterPromptPrefix = `${selectedCharacter.name}, age ${selectedCharacter.apparentAge} adult fictional character, ${selectedCharacter.gender}, ${selectedCharacter.hairColor} ${selectedCharacter.hairStyle} hair, ${selectedCharacter.eyeColor} eyes, ${selectedCharacter.bodyType} body. `;
        if (!params.seed && selectedCharacter.baseSeed) {
          effectiveSeed = selectedCharacter.baseSeed;
        }
      }
    }

    const fullPrompt = `${characterPromptPrefix}${params.prompt}`.trim();
    const negativePrompt = params.negativePrompt || selectedCharacter?.negativePrompt || "lowres, bad anatomy, deformed, blurry";

    // 2. HARD SAFETY GATE: Multi-Stage Prompt Moderation
    const moderationCheck = validatePrompt(fullPrompt);
    if (moderationCheck.blocked) {
      // Log blocked attempt to audit log for compliance
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PROMPT_BLOCKED",
          metadata: JSON.stringify({
            category: moderationCheck.category,
            flaggedTerms: moderationCheck.flaggedTerms,
            reason: moderationCheck.reason,
            promptSnippet: fullPrompt.slice(0, 100),
          }),
        },
      });

      return NextResponse.json(
        {
          error: `Prompt violation: ${moderationCheck.reason}`,
          code: "SAFETY_FILTER_TRIGGERED",
          category: moderationCheck.category,
          flaggedTerms: moderationCheck.flaggedTerms,
        },
        { status: 400 }
      );
    }

    // Check negative prompt too
    const negativeCheck = validatePrompt(negativePrompt);
    if (negativeCheck.blocked) {
      return NextResponse.json(
        {
          error: `Negative prompt violation: ${negativeCheck.reason}`,
          code: "SAFETY_FILTER_TRIGGERED",
          category: negativeCheck.category,
        },
        { status: 400 }
      );
    }

    // 3. Atomically Deduct Credits in Ledger
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        creditBalance: { decrement: costCredits },
        creditsLedger: {
          create: {
            amount: -costCredits,
            balanceAfter: user.creditBalance - costCredits,
            transactionType: "GENERATION_DEBIT",
            description: `${params.type} generation (${params.numOutputs} output${params.numOutputs > 1 ? "s" : ""})`,
          },
        },
      },
    });

    // 4. Create Generation and Job records in Database
    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        characterId: selectedCharacter?.id,
        type: params.type,
        prompt: params.prompt,
        negativePrompt: negativePrompt,
        stylePreset: params.stylePreset,
        aspectRatio: params.aspectRatio,
        seed: effectiveSeed,
        numOutputs: params.numOutputs,
        videoDuration: params.videoDuration,
        motionStrength: params.motionStrength,
        resolution: params.resolution,
        status: "PROCESSING",
        costCredits,
        jobs: {
          create: {
            queueName: "generation-queue",
            status: "ACTIVE",
            progress: 25,
            stepDescription: "Synthesizing prompt conditioning and model weights",
          },
        },
      },
      include: {
        jobs: true,
      },
    });

    const activeJob = generation.jobs[0];

    // 5. Invoke Generation Provider (ComfyUI / Generic REST / Mock)
    const provider = getGenerationProvider();
    let genResult;

    if (params.type === "VIDEO") {
      genResult = await provider.generateVideo({
        prompt: fullPrompt,
        negativePrompt,
        stylePreset: params.stylePreset as StylePreset,
        aspectRatio: params.aspectRatio as AspectRatio,
        seed: effectiveSeed,
        numOutputs: 1,
        videoDuration: params.videoDuration || 4.0,
        motionStrength: params.motionStrength || 0.65,
      });
    } else {
      genResult = await provider.generateImage({
        prompt: fullPrompt,
        negativePrompt,
        stylePreset: params.stylePreset as StylePreset,
        aspectRatio: params.aspectRatio as AspectRatio,
        seed: effectiveSeed,
        numOutputs: params.numOutputs,
        resolution: params.resolution,
        characterAttributes: selectedCharacter
          ? {
              apparentAge: selectedCharacter.apparentAge,
              gender: selectedCharacter.gender,
              hair: selectedCharacter.hairColor,
              eyes: selectedCharacter.eyeColor,
              bodyType: selectedCharacter.bodyType,
            }
          : undefined,
      });
    }

    // 6. Post-Generation Output Classifier Hook
    for (const output of genResult.outputs) {
      const classification = await defaultOutputClassifier.classifyImage(output.url);
      if (!classification.passed) {
        // Quarantine and fail
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: "FLAGGED",
            errorMessage: "Generated output did not pass content safety check.",
          },
        });

        return NextResponse.json(
          { error: "Generation output quarantined by automated safety inspection." },
          { status: 422 }
        );
      }
    }

    // 7. Store Output Assets in Private Asset Table
    const createdAssets = await Promise.all(
      genResult.outputs.map((out) =>
        prisma.asset.create({
          data: {
            generationId: generation.id,
            storageKey: out.storageKey,
            storageProvider: provider.name,
            url: out.url,
            mimeType: out.mimeType,
            fileSizeBytes: out.fileSizeBytes,
            width: out.width,
            height: out.height,
            duration: out.duration,
            sha256Hash: out.sha256Hash,
          },
        })
      )
    );

    // 8. Update Generation & Job status to COMPLETED
    const completedGeneration = await prisma.generation.update({
      where: { id: generation.id },
      data: {
        status: "COMPLETED",
      },
      include: {
        assets: true,
        character: true,
      },
    });

    if (activeJob) {
      await prisma.job.update({
        where: { id: activeJob.id },
        data: {
          status: "COMPLETED",
          progress: 100,
          stepDescription: "Finished successfully",
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      generation: completedGeneration,
      assets: createdAssets,
      remainingCredits: updatedUser.creditBalance,
    });
  } catch (err: any) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Generation processing failed: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
