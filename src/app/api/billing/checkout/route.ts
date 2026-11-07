import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getPaymentProcessor } from "@/lib/payments";
import { z } from "zod";

const checkoutSchema = z.object({
  tierOrPackId: z.string(),
  amountCredits: z.number().int().min(10),
  type: z.enum(["CREDIT_PACK", "SUBSCRIPTION"]),
  tier: z.enum(["CREATOR", "PRO", "STUDIO"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
    }

    const processor = getPaymentProcessor();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await processor.createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      priceId: parsed.data.tierOrPackId,
      amountCredits: parsed.data.amountCredits,
      type: parsed.data.type,
      tier: parsed.data.tier,
      successUrl: `${origin}/settings/billing?status=success`,
      cancelUrl: `${origin}/settings/billing?status=canceled`,
    });

    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
