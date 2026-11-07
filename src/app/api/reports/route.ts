import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reportSchema = z.object({
  generationId: z.string().optional(),
  reason: z.string().min(3).max(200),
  details: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid report data" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterUserId: user.id,
        generationId: parsed.data.generationId,
        reason: parsed.data.reason,
        details: parsed.data.details,
        status: "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CONTENT_REPORT_SUBMITTED",
        metadata: JSON.stringify({ reportId: report.id, reason: report.reason }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted to compliance and moderation team.",
      reportId: report.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
