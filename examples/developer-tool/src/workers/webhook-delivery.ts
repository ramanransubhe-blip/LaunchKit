import { enqueue, processQueue } from "@devlaunchkit/queue";
import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";

const logger = createLogger({ service: "webhook-delivery" });

interface WebhookPayload {
  webhookId: string;
  url: string;
  event: string;
  data: Record<string, unknown>;
  attempt: number;
}

const MAX_RETRIES = 5;
const RETRY_DELAYS_MS = [1000, 5000, 30000, 120000, 600000];

/**
 * Webhook delivery worker.
 * Processes queued webhook events with exponential backoff retries.
 */
async function deliverWebhook(payload: WebhookPayload): Promise<void> {
  const { webhookId, url, event, data, attempt } = payload;

  logger.info("Delivering webhook", { webhookId, url, event, attempt });

  try {
    const body = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    const signature = await signPayload(body);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event,
        "X-Webhook-Id": webhookId,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    await db("webhook_deliveries").insert({
      webhook_id: webhookId,
      url,
      event,
      status_code: response.status,
      attempt,
      success: response.ok,
      response_body: await response.text().catch(() => null),
      delivered_at: new Date(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    logger.info("Webhook delivered successfully", { webhookId, statusCode: response.status });
  } catch (error) {
    logger.error("Webhook delivery failed", { webhookId, attempt, error });

    await db("webhook_deliveries").insert({
      webhook_id: webhookId,
      url,
      event,
      status_code: null,
      attempt,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      delivered_at: new Date(),
    });

    /** Retry with exponential backoff */
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAYS_MS[attempt - 1] ?? 600000;
      logger.info("Scheduling webhook retry", {
        webhookId,
        nextAttempt: attempt + 1,
        delayMs: delay,
      });

      setTimeout(() => {
        enqueue("webhook-delivery", {
          ...payload,
          attempt: attempt + 1,
        }).catch((err: unknown) =>
          logger.error("Failed to enqueue webhook retry", { error: err })
        );
      }, delay);
    } else {
      logger.error("Webhook delivery permanently failed — max retries exceeded", {
        webhookId,
        url,
        totalAttempts: attempt,
      });

      await db("webhooks")
        .where({ id: webhookId })
        .update({ status: "failed", updated_at: new Date() });
    }
  }
}

async function signPayload(body: string): Promise<string> {
  const secret = process.env.WEBHOOK_SIGNING_SECRET ?? "whsec_default";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Start the worker process */
async function main(): Promise<void> {
  logger.info("Webhook delivery worker started");

  processQueue("webhook-delivery", async (job: WebhookPayload) => {
    await deliverWebhook(job);
  });
}

main().catch((error) => {
  logger.error("Webhook delivery worker crashed", { error });
  process.exit(1);
});
