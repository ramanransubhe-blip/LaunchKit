import { getGlobalBillingService } from "../core/factory.js";
import type { BillingWebhookEvent } from "../core/contracts.js";
import { BillingWebhookError } from "../core/errors.js";

/**
 * Standard dispatcher for verification of provider webhook signatures.
 *
 * @param rawBody - Raw text request body.
 * @param signature - Signature header.
 * @param secret - Configured webhook secret.
 * @returns Validated webhook event payload.
 */
export async function handleIncomingWebhook(
  rawBody: string,
  signature: string,
  secret: string
): Promise<BillingWebhookEvent> {
  const billingService = getGlobalBillingService();
  if (!signature) {
    throw new BillingWebhookError("Webhook signature header is missing.");
  }
  if (!secret) {
    throw new BillingWebhookError("Server webhook secret key is unconfigured.");
  }
  return billingService.validateWebhook(rawBody, signature, secret);
}
