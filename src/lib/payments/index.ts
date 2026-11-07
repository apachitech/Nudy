/**
 * Agnostic Payment & Billing Processor
 * Supports Stripe, CCBill, Segpay, or custom adult-friendly processors.
 */

export interface CheckoutSessionOptions {
  userId: string;
  userEmail: string;
  priceId: string;
  amountCredits: number;
  type: "CREDIT_PACK" | "SUBSCRIPTION";
  tier?: "CREATOR" | "PRO" | "STUDIO";
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface WebhookEventPayload {
  eventType: "PAYMENT_SUCCEEDED" | "SUBSCRIPTION_CREATED" | "SUBSCRIPTION_CANCELED";
  userId: string;
  amountCredits: number;
  transactionReference: string;
  tier?: string;
  amountCents?: number;
}

export interface IPaymentProcessor {
  name: string;
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult>;
  verifyAndParseWebhook(rawBody: string, signature: string): Promise<WebhookEventPayload | null>;
}

export class MockPaymentProcessor implements IPaymentProcessor {
  name = "mock";

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    const sessionId = `mock_checkout_${options.userId}_${Date.now()}`;
    return {
      sessionId,
      checkoutUrl: `/settings/billing?checkout_session=${sessionId}&status=success&credits=${options.amountCredits}`,
    };
  }

  async verifyAndParseWebhook(rawBody: string, signature: string): Promise<WebhookEventPayload | null> {
    try {
      const payload = JSON.parse(rawBody);
      return {
        eventType: payload.eventType || "PAYMENT_SUCCEEDED",
        userId: payload.userId,
        amountCredits: payload.amountCredits || 100,
        transactionReference: payload.transactionReference || `tx_${Date.now()}`,
        tier: payload.tier,
      };
    } catch {
      return null;
    }
  }
}

export function getPaymentProcessor(): IPaymentProcessor {
  return new MockPaymentProcessor();
}

