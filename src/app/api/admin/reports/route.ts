import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const actionSchema = z.object({
  reportId: z.string(),
  action: z.enum(["DISMISS", "TAKEDOWN_CONTENT", "BAN_USER"]),
  reason: z.string().min(3),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden: Admin or Moderator access required" }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, email: true, name: true },
        },
        generation: {
          include: {
            assets: true,
            user: { select: { id: true, email: true, name: true, isBanned: true } },
          },
        },
      },
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, role: true } },
      },
    });

    return NextResponse.json({ reports, recentAuditLogs });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load moderation queue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden: Admin or Moderator access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 });
    }

    const { reportId, action, reason } = parsed.data;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { generation: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (action === "DISMISS") {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DISMISSED",
          reviewedBy: user.email,
          reviewedAt: new Date(),
        },
      });
    } else if (action === "TAKEDOWN_CONTENT") {
      if (report.generationId) {
        await prisma.generation.delete({
          where: { id: report.generationId },
        });
      }
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "ACTIONED",
          reviewedBy: user.email,
          reviewedAt: new Date(),
        },
      });
    } else if (action === "BAN_USER") {
      if (report.generation?.userId) {
        await prisma.user.update({
          where: { id: report.generation.userId },
          data: {
            isBanned: true,
            banReason: reason,
          },
        });

        await prisma.moderationAction.create({
          data: {
            targetUserId: report.generation.userId,
            moderatorId: user.id,
            actionType: "PERMANENT_BAN",
            reason,
            relatedReportId: reportId,
          },
        });
      }

      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "ACTIONED",
          reviewedBy: user.email,
          reviewedAt: new Date(),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `MODERATION_ACTION_${action}`,
        metadata: JSON.stringify({ reportId, reason, moderator: user.email }),
      },
    });

    return NextResponse.json({ success: true, message: `Moderation action ${action} executed.` });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to apply moderation action" }, { status: 500 });
  }
}
