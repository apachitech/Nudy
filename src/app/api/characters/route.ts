import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const characterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  apparentAge: z.number().int().min(18, "Apparent age must be at least 18").max(99),
  gender: z.string().default("female"),
  bodyType: z.string().default("athletic"),
  hairStyle: z.string().default("long wavy"),
  hairColor: z.string().default("blonde"),
  eyeColor: z.string().default("blue"),
  ethnicity: z.string().optional(),
  faceFeatures: z.string().optional(),
  outfit: z.string().optional(),
  personality: z.string().optional(),
  setting: z.string().optional(),
  defaultPrompt: z.string().optional(),
  negativePrompt: z.string().optional(),
  baseSeed: z.number().int().optional(),
  referenceAssetId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const characters = await prisma.character.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { generations: true },
        },
      },
    });

    return NextResponse.json({ characters });
  } catch (err: any) {
    console.error("Characters GET error:", err);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safety: Age verification requirement to create adult character profiles
    if (!user.isAgeVerified) {
      return NextResponse.json(
        { error: "Age and identity verification (18+) required before creating character profiles." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = characterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid character data" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Strict apparent age validation: must be at least 18
    if (data.apparentAge < 18) {
      return NextResponse.json(
        { error: "Character apparent age must be at least 18 years old." },
        { status: 400 }
      );
    }

    const seed = data.baseSeed || Math.floor(Math.random() * 900000) + 100000;

    const character = await prisma.character.create({
      data: {
        userId: user.id,
        name: data.name,
        apparentAge: data.apparentAge,
        gender: data.gender,
        bodyType: data.bodyType,
        hairStyle: data.hairStyle,
        hairColor: data.hairColor,
        eyeColor: data.eyeColor,
        ethnicity: data.ethnicity,
        faceFeatures: data.faceFeatures,
        outfit: data.outfit,
        personality: data.personality,
        setting: data.setting,
        defaultPrompt: data.defaultPrompt,
        negativePrompt: data.negativePrompt,
        baseSeed: seed,
        referenceAssetId: data.referenceAssetId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CHARACTER_CREATED",
        metadata: JSON.stringify({ characterId: character.id, name: character.name, apparentAge: character.apparentAge }),
      },
    });

    return NextResponse.json({ character }, { status: 201 });
  } catch (err: any) {
    console.error("Character create error:", err);
    return NextResponse.json({ error: "Failed to create character" }, { status: 500 });
  }
}
