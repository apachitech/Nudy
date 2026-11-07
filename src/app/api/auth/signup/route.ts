import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth/session";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  confirmAge: z.boolean().refine((val) => val === true, {
    message: "You must confirm you are at least 18 years old",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        isAgeVerified: false, // Must be verified via KYC
        creditBalance: 50, // Welcome grant
        creditsLedger: {
          create: {
            amount: 50,
            balanceAfter: 50,
            transactionType: "SIGNUP_BONUS",
            description: "Welcome bonus credits",
          },
        },
        auditLogs: {
          create: {
            action: "USER_SIGNUP",
            metadata: JSON.stringify({ email: email.toLowerCase() }),
          },
        },
      },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isAgeVerified: user.isAgeVerified,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAgeVerified: user.isAgeVerified,
        creditBalance: user.creditBalance,
      },
      token,
    });

    response.cookies.set("nudy_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
