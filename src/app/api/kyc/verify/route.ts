import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getKYCProvider } from "@/lib/kyc";
import { z } from "zod";

const kycRequestSchema = z.object({
  idDocumentType: z.enum(["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"]).default("DRIVERS_LICENSE"),
  birthDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = kycRequestSchema.safeParse(body);
    const docType = parsed.success ? parsed.data.idDocumentType : "DRIVERS_LICENSE";

    const kycProvider = getKYCProvider();
    const session = await kycProvider.createSession(user.id, user.email);

    // In mock mode, immediately verify the user
    const verification = await kycProvider.verifySession(session.sessionId);

    if (verification.status === "APPROVED") {
      await prisma.$transaction([
        prisma.verificationRecord.create({
          data: {
            userId: user.id,
            provider: kycProvider.name,
            providerReference: verification.providerReference,
            status: "APPROVED",
            idDocumentType: docType,
            verifiedAge: verification.verifiedAge || 25,
            documentHash: verification.documentHash || `hash_${Date.now()}`,
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { isAgeVerified: true },
        }),
        prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "KYC_AGE_VERIFIED",
            metadata: JSON.stringify({
              provider: kycProvider.name,
              verifiedAge: verification.verifiedAge || 25,
              timestamp: new Date().toISOString(),
            }),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        status: "APPROVED",
        isAgeVerified: true,
        verifiedAge: verification.verifiedAge || 25,
        message: "Identity and age verified successfully. You are now authorized to generate content.",
      });
    }

    return NextResponse.json({
      success: false,
      status: verification.status,
      message: "Verification pending or rejected",
    });
  } catch (err: any) {
    console.error("KYC verification error:", err);
    return NextResponse.json(
      { error: "Failed to process age verification" },
      { status: 500 }
    );
  }
}
