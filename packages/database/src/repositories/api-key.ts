import { BaseRepository } from "./base";
import { APIKey, InsertAPIKey } from "../types";
import { apiKeys, apiRequests, rateLimits } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export class APIKeyRepository extends BaseRepository<APIKey, InsertAPIKey, typeof apiKeys> {
  constructor() {
    super(apiKeys);
  }

  // Verify and retrieve key parameters
  async verifyKey(keyHash: string): Promise<APIKey | null> {
    const results = await this.db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyHash, keyHash),
          eq(apiKeys.active, true)
        )
      )
      .limit(1);

    const key = results[0];
    if (!key) return null;

    // Check expiry
    if (key.expiresAt && new Date() > new Date(key.expiresAt)) {
      await this.db.update(apiKeys).set({ active: false }).where(eq(apiKeys.id, key.id));
      return null;
    }

    return key;
  }

  // Log API request metrics
  async logRequest(data: {
    apiKeyId: string;
    path: string;
    method: string;
    statusCode: number;
    responseTimeMs: number;
  }): Promise<void> {
    await this.db.insert(apiRequests).values(data);
  }

  // Check rate limit using sliding window
  async checkRateLimit(targetId: string, limit: number, windowSeconds = 60): Promise<{ allowed: boolean; remaining: number }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowSeconds * 1000);

    // Upsert rate limit row
    await this.db
      .insert(rateLimits)
      .values({
        targetId,
        windowStart,
        count: 0,
      })
      .onConflictDoNothing({ target: [rateLimits.targetId, rateLimits.windowStart] });

    // Update count
    const results = await this.db
      .update(rateLimits)
      .set({
        count: sql`${rateLimits.count} + 1`,
      })
      .where(
        and(
          eq(rateLimits.targetId, targetId),
          eq(rateLimits.windowStart, windowStart)
        )
      )
      .returning();

    const row = results[0];
    const count = row?.count || 1;

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
    };
  }
}
