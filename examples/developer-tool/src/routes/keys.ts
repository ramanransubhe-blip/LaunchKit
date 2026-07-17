import { Router, type Request, type Response } from "express";
import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";
import { randomBytes } from "node:crypto";

const router = Router();
const logger = createLogger({ service: "api-keys" });

/** Create a new API key for the authenticated user */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, tier = "free", expiresInDays } = req.body;

    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const validTiers = ["free", "starter", "pro", "enterprise"];
    if (!validTiers.includes(tier)) {
      res.status(400).json({ error: `tier must be one of: ${validTiers.join(", ")}` });
      return;
    }

    const prefix = "dlk";
    const secret = randomBytes(32).toString("hex");
    const key = `${prefix}_${tier.charAt(0)}${tier === "enterprise" ? "e" : ""}${secret.slice(0, 32)}`;
    const keyHash = await hashKey(key);

    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;

    const [apiKey] = await db("api_keys")
      .insert({
        name,
        key_prefix: key.slice(0, 12),
        key_hash: keyHash,
        tier,
        rate_limit: getRateLimit(tier),
        expires_at: expiresAt,
        last_used_at: null,
        request_count: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");

    logger.info("API key created", { keyId: apiKey.id, name, tier });

    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key,
      keyPrefix: apiKey.key_prefix,
      tier: apiKey.tier,
      rateLimit: apiKey.rate_limit,
      expiresAt: apiKey.expires_at,
      createdAt: apiKey.created_at,
      warning: "Store this key securely — it will not be shown again.",
    });
  } catch (error) {
    logger.error("Failed to create API key", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** List all API keys (secrets are never returned) */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const keys = await db("api_keys")
      .select(
        "id",
        "name",
        "key_prefix",
        "tier",
        "rate_limit",
        "is_active",
        "expires_at",
        "last_used_at",
        "request_count",
        "created_at"
      )
      .orderBy("created_at", "desc");

    res.json({ keys });
  } catch (error) {
    logger.error("Failed to list API keys", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Revoke an API key */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [revoked] = await db("api_keys")
      .where({ id })
      .update({ is_active: false, updated_at: new Date() })
      .returning("id");

    if (!revoked) {
      res.status(404).json({ error: "API key not found" });
      return;
    }

    logger.info("API key revoked", { keyId: id });
    res.json({ message: "API key revoked", id });
  } catch (error) {
    logger.error("Failed to revoke API key", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

function getRateLimit(tier: string): number {
  const limits: Record<string, number> = {
    free: 100,
    starter: 1000,
    pro: 10000,
    enterprise: 100000,
  };
  return limits[tier] ?? 100;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export { router as keysRouter };
