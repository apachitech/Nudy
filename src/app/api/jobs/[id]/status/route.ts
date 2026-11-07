import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      stepDescription: job.stepDescription,
      generation: job.generation,
      error: job.error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to poll job status" }, { status: 500 });
  }
}

