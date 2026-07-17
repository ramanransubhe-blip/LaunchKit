import { z } from "zod";

export const createCheckoutSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  priceId: z.string().min(1, "Price ID is required"),
  successUrl: z.string().url("Valid success URL is required"),
  cancelUrl: z.string().url("Valid cancel URL is required"),
});

export const upgradePlanSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  newPriceId: z.string().min(1, "New price ID is required"),
});

export const consumeCreditsSchema = z.object({
  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
  amount: z.number().int().positive("Credit consumption amount must be a positive integer"),
});

export const applyCouponSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  couponCode: z.string().trim().min(1, "Coupon code is required"),
});

export function validatePayload<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Validation failed: ${result.error.errors.map((e: { message: string }) => e.message).join(", ")}`
    );
  }
  return result.data;
}
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type UpgradePlanInput = z.infer<typeof upgradePlanSchema>;
export type ConsumeCreditsInput = z.infer<typeof consumeCreditsSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
