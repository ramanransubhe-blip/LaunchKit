"use server";

import { getGlobalBillingService } from "../core/factory.js";
import { serializeBillingError } from "../core/errors.js";
import {
  createCheckoutSchema,
  upgradePlanSchema,
  consumeCreditsSchema,
  applyCouponSchema,
} from "../validators/index.js";
import type {
  BillingCheckout,
  BillingSubscription,
  BillingPortal,
  BillingCredits,
} from "../core/contracts.js";

export interface BillingActionResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

async function handleActionError<T>(error: unknown): Promise<BillingActionResponse<T>> {
  const serialized = serializeBillingError(error);
  return {
    success: false,
    data: null,
    error: {
      code: serialized.error.code,
      message: serialized.error.message,
      details: serialized.error.details,
    },
  };
}

export async function createCheckoutAction(
  rawInput: unknown
): Promise<BillingActionResponse<BillingCheckout>> {
  try {
    const input = createCheckoutSchema.parse(rawInput);
    const service = getGlobalBillingService();
    const result = await service.createCheckout(
      input.customerId,
      input.priceId,
      input.successUrl,
      input.cancelUrl
    );
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPortalAction(
  customerId: string,
  returnUrl: string
): Promise<BillingActionResponse<BillingPortal>> {
  try {
    const service = getGlobalBillingService();
    const result = await service.createPortal(customerId, returnUrl);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function upgradePlanAction(
  rawInput: unknown
): Promise<BillingActionResponse<BillingSubscription>> {
  try {
    const input = upgradePlanSchema.parse(rawInput);
    const service = getGlobalBillingService();
    const result = await service.upgradePlan(input.subscriptionId, input.newPriceId);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function cancelSubscriptionAction(
  subscriptionId: string
): Promise<BillingActionResponse<BillingSubscription>> {
  try {
    const service = getGlobalBillingService();
    const result = await service.cancelSubscription(subscriptionId);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function resumeSubscriptionAction(
  subscriptionId: string
): Promise<BillingActionResponse<BillingSubscription>> {
  try {
    const service = getGlobalBillingService();
    const result = await service.resumeSubscription(subscriptionId);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function addCreditsAction(
  organizationId: string,
  amount: number
): Promise<BillingActionResponse<BillingCredits>> {
  try {
    const service = getGlobalBillingService();
    const result = await service.addCredits(organizationId, amount);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
