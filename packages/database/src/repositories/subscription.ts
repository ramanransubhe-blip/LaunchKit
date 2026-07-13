import { BaseRepository } from "./base";
import { Subscription, InsertSubscription } from "../types";
import { subscriptions, prices, products, credits, usageTracking, invoices } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export class SubscriptionRepository extends BaseRepository<Subscription, InsertSubscription, typeof subscriptions> {
  constructor() {
    super(subscriptions);
  }

  // Find active subscription for organization
  async findActiveSubscription(organizationId: string): Promise<any | null> {
    const results = await this.db
      .select({
        subscription: subscriptions,
        price: prices,
        product: products,
      })
      .from(subscriptions)
      .innerJoin(prices, eq(subscriptions.priceId, prices.id))
      .innerJoin(products, eq(prices.productId, products.id))
      .where(
        and(
          eq(subscriptions.organizationId, organizationId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);
    return results[0] || null;
  }

  // Find usage counter
  async getUsage(organizationId: string, featureName: string): Promise<number> {
    const results = await this.db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.organizationId, organizationId),
          eq(usageTracking.featureName, featureName)
        )
      )
      .limit(1);

    return results[0]?.usageValue || 0;
  }

  // Increment usage with check
  async incrementUsage(
    organizationId: string,
    featureName: string,
    amount: number
  ): Promise<{ usage: number; limit: number; allowed: boolean }> {
    // Upsert tracking counter first
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    await this.db
      .insert(usageTracking)
      .values({
        organizationId,
        featureName,
        usageValue: 0,
        limitValue: 1000, // default limit
        resetAt: nextMonth,
      })
      .onConflictDoNothing({ target: [usageTracking.organizationId, usageTracking.featureName] });

    // Update value
    const results = await this.db
      .update(usageTracking)
      .set({
        usageValue: sql`${usageTracking.usageValue} + ${amount}`,
        updatedAt: now,
      })
      .where(
        and(
          eq(usageTracking.organizationId, organizationId),
          eq(usageTracking.featureName, featureName)
        )
      )
      .returning();

    const row = results[0];
    if (!row) throw new Error("Feature tracking not found.");

    return {
      usage: row.usageValue,
      limit: row.limitValue,
      allowed: row.usageValue <= row.limitValue,
    };
  }

  // Get credit balance
  async getCreditBalance(organizationId: string): Promise<number> {
    const results = await this.db
      .select()
      .from(credits)
      .where(eq(credits.organizationId, organizationId))
      .limit(1);
    return results[0]?.balance || 0;
  }

  // Add credits balance
  async addCredits(organizationId: string, amount: number): Promise<number> {
    const now = new Date();
    const results = await this.db
      .insert(credits)
      .values({
        organizationId,
        balance: amount,
      })
      .onConflictDoUpdate({
        target: credits.organizationId,
        set: {
          balance: sql`${credits.balance} + ${amount}`,
          updatedAt: now,
        },
      })
      .returning();

    return results[0]?.balance || 0;
  }

  // Deduct credits
  async deductCredits(organizationId: string, amount: number): Promise<{ success: boolean; balance: number }> {
    const balance = await this.getCreditBalance(organizationId);
    if (balance < amount) {
      return { success: false, balance };
    }

    const results = await this.db
      .update(credits)
      .set({
        balance: sql`${credits.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(credits.organizationId, organizationId))
      .returning();

    return {
      success: true,
      balance: results[0]?.balance || 0,
    };
  }
}
