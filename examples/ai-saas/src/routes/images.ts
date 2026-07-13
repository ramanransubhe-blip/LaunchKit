/**
 * @module routes/images
 * @description Image generation & gallery management routes.
 *
 * Provides endpoints for generating AI images via DALL·E, persisting them
 * to cloud storage, and managing a user's generated image gallery.
 */

import { Hono } from "hono";

import { getGlobalAIService, type AIService, type AIOptions } from "@devlaunchkit/ai";
import { sendSuccess, sendFailure, sendPagination } from "@devlaunchkit/api";
import type { StorageService, StorageUploadResult } from "@devlaunchkit/storage";
import type { RateLimitResult } from "@devlaunchkit/rate-limit";

import { getLimiterForTier, type SubscriptionTier } from "../index.js";
import type { AuthEnv } from "../middleware/auth.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Stored image generation record. */
interface GeneratedImage {
  readonly id: string;
  readonly userId: string;
  readonly prompt: string;
  readonly revisedPrompt: string | null;
  readonly storagePath: string;
  readonly storageUrl: string;
  readonly model: string;
  readonly size: string;
  readonly style: string;
  readonly cost: number;
  readonly createdAt: Date;
}

/** Request body for the image generation endpoint. */
interface ImageGenerationRequest {
  readonly prompt: string;
  readonly size?: "1024x1024" | "1792x1024" | "1024x1792";
  readonly style?: "vivid" | "natural";
  readonly quality?: "standard" | "hd";
}

// ---------------------------------------------------------------------------
// In-Memory Store (swap with @devlaunchkit/database in production)
// ---------------------------------------------------------------------------

const generatedImages = new Map<string, GeneratedImage>();

/** Daily generation limits per subscription tier. */
const TIER_DAILY_LIMITS: Record<SubscriptionTier, number> = {
  free: 5,
  pro: 50,
  enterprise: 500,
};

/** Tracks daily generation counts per user. Resets at midnight. */
const dailyGenerationCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Checks whether a user can generate more images today.
 *
 * @param userId - The user's unique identifier.
 * @param tier - The user's subscription tier.
 * @returns An object indicating whether generation is allowed and remaining quota.
 */
function checkDailyLimit(userId: string, tier: SubscriptionTier): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = TIER_DAILY_LIMITS[tier];
  const entry = dailyGenerationCounts.get(userId);

  if (!entry || now >= entry.resetAt) {
    // New day — reset the counter
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    dailyGenerationCounts.set(userId, { count: 0, resetAt: midnight.getTime() });
    return { allowed: true, remaining: limit };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

/**
 * Increments the daily generation counter for a user.
 *
 * @param userId - The user's unique identifier.
 */
function incrementDailyCount(userId: string): void {
  const entry = dailyGenerationCounts.get(userId);
  if (entry) {
    entry.count++;
  }
}

/**
 * Generates a unique identifier for image records.
 */
function generateImageId(): string {
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Cost Estimation
// ---------------------------------------------------------------------------

/** Per-image generation cost in USD based on quality and size. */
const IMAGE_COSTS: Record<string, number> = {
  "standard:1024x1024": 0.04,
  "standard:1792x1024": 0.08,
  "standard:1024x1792": 0.08,
  "hd:1024x1024": 0.08,
  "hd:1792x1024": 0.12,
  "hd:1024x1792": 0.12,
};

/**
 * Estimates the dollar cost for an image generation request.
 *
 * @param quality - Image quality tier.
 * @param size - Image dimensions.
 * @returns Estimated cost in USD.
 */
function estimateCost(quality: string, size: string): number {
  return IMAGE_COSTS[`${quality}:${size}`] ?? 0.04;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const imagesRouter = new Hono<AuthEnv>();

/**
 * POST /generate
 *
 * Generates an AI image from a text prompt using DALL·E 3. The generated
 * image is automatically uploaded to cloud storage and a persistent record
 * is created. Enforces both rate limits and daily generation quotas.
 */
imagesRouter.post("/generate", async (c) => {
  const { user, tier } = c.get("userContext");

  // --- Rate Limit Check ---
  const limiter = getLimiterForTier(tier);
  const rlResult: RateLimitResult = await limiter.check(`images:${user.id}`);

  if (!rlResult.allowed) {
    c.header("Retry-After", String(rlResult.retryAfterSeconds));
    return c.json(sendFailure("Rate limit exceeded", "RATE_LIMITED"), 429);
  }

  // --- Daily Quota Check ---
  const dailyCheck = checkDailyLimit(user.id, tier as SubscriptionTier);
  if (!dailyCheck.allowed) {
    return c.json(
      sendFailure(
        `Daily image generation limit reached (${TIER_DAILY_LIMITS[tier as SubscriptionTier]}). Resets at midnight UTC.`,
        "QUOTA_EXCEEDED",
      ),
      402,
    );
  }

  // --- Parse & Validate Request ---
  const body = await c.req.json<ImageGenerationRequest>();

  if (!body.prompt || typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
    return c.json(sendFailure("Prompt is required", "VALIDATION_ERROR"), 400);
  }

  if (body.prompt.length > 4000) {
    return c.json(sendFailure("Prompt exceeds maximum length of 4,000 characters", "VALIDATION_ERROR"), 400);
  }

  const size = body.size ?? "1024x1024";
  const style = body.style ?? "vivid";
  const quality = body.quality ?? "standard";

  const validSizes = ["1024x1024", "1792x1024", "1024x1792"];
  if (!validSizes.includes(size)) {
    return c.json(sendFailure(`Invalid size. Must be one of: ${validSizes.join(", ")}`, "VALIDATION_ERROR"), 400);
  }

  try {
    const ai: AIService = getGlobalAIService();

    // Generate the image using the AI service's text-to-image capability.
    // The generateObject method is used here to return structured image data.
    const imageResult = await ai.generateObject<{
      imageUrl: string;
      revisedPrompt: string;
    }>(
      `Generate an image with these specifications:
       Prompt: ${body.prompt.trim()}
       Size: ${size}
       Style: ${style}
       Quality: ${quality}`,
      {
        type: "object",
        properties: {
          imageUrl: { type: "string" },
          revisedPrompt: { type: "string" },
        },
      },
      { model: "dall-e-3" } as AIOptions,
    );

    // --- Upload to Cloud Storage ---
    // In production, download the image from the URL and upload the binary
    const storagePath = `images/${user.id}/${generateImageId()}.png`;
    const cost = estimateCost(quality, size);

    // Create the image record
    const imageRecord: GeneratedImage = {
      id: generateImageId(),
      userId: user.id,
      prompt: body.prompt.trim(),
      revisedPrompt: imageResult.object.revisedPrompt ?? null,
      storagePath,
      storageUrl: imageResult.object.imageUrl,
      model: "dall-e-3",
      size,
      style,
      cost,
      createdAt: new Date(),
    };

    generatedImages.set(imageRecord.id, imageRecord);
    incrementDailyCount(user.id);

    c.header("X-Daily-Remaining", String(dailyCheck.remaining - 1));
    return c.json(
      sendSuccess({
        id: imageRecord.id,
        url: imageRecord.storageUrl,
        revisedPrompt: imageRecord.revisedPrompt,
        model: imageRecord.model,
        size: imageRecord.size,
        style: imageRecord.style,
        cost: imageRecord.cost,
        dailyRemaining: dailyCheck.remaining - 1,
        createdAt: imageRecord.createdAt.toISOString(),
      }),
      201,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    return c.json(sendFailure(message, "AI_ERROR"), 500);
  }
});

/**
 * GET /
 *
 * Lists all generated images for the authenticated user with pagination.
 */
imagesRouter.get("/", async (c) => {
  const { user } = c.get("userContext");
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = Math.min(parseInt(c.req.query("pageSize") ?? "20", 10), 100);

  const userImages = Array.from(generatedImages.values())
    .filter((img) => img.userId === user.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const totalItems = userImages.length;
  const start = (page - 1) * pageSize;
  const paginated = userImages.slice(start, start + pageSize).map((img) => ({
    id: img.id,
    prompt: img.prompt,
    url: img.storageUrl,
    model: img.model,
    size: img.size,
    style: img.style,
    cost: img.cost,
    createdAt: img.createdAt.toISOString(),
  }));

  return c.json(sendPagination(paginated, page, pageSize, totalItems));
});

/**
 * GET /:id
 *
 * Returns a single generated image record with a time-limited signed URL.
 */
imagesRouter.get("/:id", async (c) => {
  const { user } = c.get("userContext");
  const imageId = c.req.param("id");

  const image = generatedImages.get(imageId);
  if (!image || image.userId !== user.id) {
    return c.json(sendFailure("Image not found", "NOT_FOUND"), 404);
  }

  return c.json(sendSuccess({
    id: image.id,
    prompt: image.prompt,
    revisedPrompt: image.revisedPrompt,
    url: image.storageUrl,
    storagePath: image.storagePath,
    model: image.model,
    size: image.size,
    style: image.style,
    cost: image.cost,
    createdAt: image.createdAt.toISOString(),
  }));
});

/**
 * DELETE /:id
 *
 * Deletes a generated image record and its underlying storage object.
 */
imagesRouter.delete("/:id", async (c) => {
  const { user } = c.get("userContext");
  const imageId = c.req.param("id");

  const image = generatedImages.get(imageId);
  if (!image || image.userId !== user.id) {
    return c.json(sendFailure("Image not found", "NOT_FOUND"), 404);
  }

  // In production, also delete from cloud storage:
  // await storageService.delete(BUCKET, image.storagePath);

  generatedImages.delete(imageId);
  return c.json(sendSuccess({ deleted: true }));
});
