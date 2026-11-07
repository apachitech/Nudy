import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPaymentProcessor } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || req.headers.get("x-signature") || "";

    const processor = getPaymentProcessor();
    const event = await processor.verifyAndParseWebhook(rawBody, signature);

    if (!event) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    if (event.eventType === "PAYMENT_SUCCEEDED" && event.userId) {
      const user = await prisma.user.findUnique({
        where: { id: event.userId },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            creditBalance: { increment: event.amountCredits },
            creditsLedger: {
              create: {
                amount: event.amountCredits,
                balanceAfter: user.creditBalance + event.amountCredits,
                transactionType: "PURCHASE",
                referenceId: event.transactionReference,
                description: `Credit purchase topup (+${event.amountCredits} credits)`,
              },
            },
            auditLogs: {
              create: {
                action: "PAYMENT_PROCESSED",
                metadata: JSON.stringify({
                  credits: event.amountCredits,
                  tx: event.transactionReference,
                }),
              },
            },
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
