import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) live progress stream for background generation jobs
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const job = await prisma.job.findFirst({
    where: {
      id: params.id,
      generation: {
        userId: user.id,
      },
    },
    include: {
      generation: {
        include: {
          assets: true,
        },
      },
    },
  });

  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state
      const initialPayload = JSON.stringify({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        stepDescription: job.stepDescription,
        assets: job.generation.assets,
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // If already finished, close
      if (job.status === "COMPLETED" || job.status === "FAILED") {
        controller.close();
        return;
      }

      // If active, stream progress intervals until completion
      let currentProgress = job.progress;
      const interval = setInterval(async () => {
        currentProgress += 20;

        if (currentProgress >= 100) {
          clearInterval(interval);
          const finalJob = await prisma.job.findUnique({
            where: { id: params.id },
            include: { generation: { include: { assets: true } } },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                jobId: params.id,
                status: "COMPLETED",
                progress: 100,
                stepDescription: "Rendering complete",
                assets: finalJob?.generation.assets || [],
              })}\n\n`
            )
          );
          controller.close();
        } else {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                jobId: params.id,
                status: "ACTIVE",
                progress: currentProgress,
                stepDescription: `Denoising & latent upscaling (${currentProgress}%)...`,
              })}\n\n`
            )
          );
        }
      }, 600);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

