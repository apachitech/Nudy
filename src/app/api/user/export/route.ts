import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const fullUserData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        verificationRecords: {
          select: {
            id: true,
            provider: true,
            status: true,
            idDocumentType: true,
            verifiedAge: true,
            createdAt: true,
          },
        },
        characters: true,
        generations: {
          include: {
            assets: true,
          },
        },
        creditsLedger: true,
        subscriptions: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DATA_EXPORT_REQUESTED",
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
      },
    });

    return new NextResponse(JSON.stringify(fullUserData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="nudy_data_export_${user.id}_${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
