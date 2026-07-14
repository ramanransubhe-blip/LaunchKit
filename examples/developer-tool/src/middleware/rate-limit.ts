import type { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "@devlaunchkit/rate-limit";
import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";

const logger = createLogger({ service: "rate-limit" });

/**
 * Tiered rate-limiting middleware.
 * Authenticates requests via `x-api-key` header and applies per-tier rate limits.
 */
export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    res.status(401).json({
      error: "Missing API key",
      message: "Include your API key in the x-api-key header",
      docs: "https://devlaunchkit.dev/docs/API",
    });
    return;
  }

  try {
    /** Hash the provided key and look it up */
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const keyHash = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const keyRecord = await db("api_keys")
      .where({ key_hash: keyHash, is_active: true })
      .first();

    if (!keyRecord) {
      res.status(403).json({ error: "Invalid or revoked API key" });
      return;
    }

    /** Check expiration */
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      res.status(403).json({ error: "API key has expired" });
      return;
    }

    /** Apply rate limit based on the key's tier */
    const rateLimitResult = await checkRateLimit({
      key: `api:${keyRecord.id}`,
      limit: keyRecord.rate_limit,
      windowSeconds: 3600,
    });

    /** Set standard rate limit headers */
    res.setHeader("X-RateLimit-Limit", keyRecord.rate_limit);
    res.setHeader("X-RateLimit-Remaining", rateLimitResult.remaining);
    res.setHeader("X-RateLimit-Reset", rateLimitResult.resetAt);

    if (!rateLimitResult.allowed) {
      logger.warn("Rate limit exceeded", {
        keyId: keyRecord.id,
        tier: keyRecord.tier,
        limit: keyRecord.rate_limit,
      });

      res.status(429).json({
        error: "Rate limit exceeded",
        limit: keyRecord.rate_limit,
        remaining: 0,
        resetAt: rateLimitResult.resetAt,
        upgrade: "https://devlaunchkit.dev/pricing",
      });
      return;
    }

    /** Update last used timestamp and increment request count */
    await db("api_keys")
      .where({ id: keyRecord.id })
      .update({
        last_used_at: new Date(),
        request_count: db.raw("request_count + 1"),
      });

    /** Attach key info to request for downstream logging */
    (req as any).apiKeyId = keyRecord.id;
    (req as any).apiKeyTier = keyRecord.tier;

    next();
  } catch (error) {
    logger.error("Rate limit middleware error", { error });
    res.status(500).json({ error: "Internal server error" });
  }
}
