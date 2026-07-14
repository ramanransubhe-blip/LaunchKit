import { Router, type Request, type Response } from "express";
import { createPaymentClient } from "@devlaunchkit/payments";
import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";
import { isFeatureEnabled } from "@devlaunchkit/feature-flags";
import { z } from "zod";

const router = Router();
const logger = createLogger({ service: "subscriptions" });
const payments = createPaymentClient({ provider: "dodo" });

/* ------------------------------------------------------------------ */
/*  Validation schemas                                                 */
/* ------------------------------------------------------------------ */

const CreateSubscriptionSchema = z.object({
  planId: z.string().min(1),
  interval: z.enum(["monthly", "yearly"]),
  couponCode: z.string().optional(),
});

const UpdateSubscriptionSchema = z.object({
  planId: z.string().min(1).optional(),
  interval: z.enum(["monthly", "yearly"]).optional(),
});

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

/** Create a new subscription for the authenticated user */
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const body = CreateSubscriptionSchema.parse(req.body);

    const existingSubscription = await db("subscriptions")
      .where({ user_id: userId, status: "active" })
      .first();

    if (existingSubscription) {
      res.status(409).json({
        error: "Active subscription already exists",
        subscriptionId: existingSubscription.id,
      });
      return;
    }

    const plan = await db("plans").where({ id: body.planId }).first();
    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    /** Check if yearly billing is available via feature flag */
    if (body.interval === "yearly") {
      const yearlyEnabled = await isFeatureEnabled("yearly-billing", { userId });
      if (!yearlyEnabled) {
        res.status(403).json({ error: "Yearly billing is not yet available for your account" });
        return;
      }
    }

    const price = body.interval === "yearly" ? plan.yearly_price : plan.monthly_price;

    const paymentSubscription = await payments.subscriptions.create({
      customerId: userId,
      priceAmount: price,
      currency: "USD",
      interval: body.interval,
      metadata: { planId: body.planId, userId },
      couponCode: body.couponCode,
    });

    const [subscription] = await db("subscriptions")
      .insert({
        user_id: userId,
        plan_id: body.planId,
        external_id: paymentSubscription.id,
        status: "active",
        interval: body.interval,
        current_period_start: new Date(),
        current_period_end: paymentSubscription.currentPeriodEnd,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");

    logger.info("Subscription created", {
      userId,
      subscriptionId: subscription.id,
      planId: body.planId,
    });

    res.status(201).json({ subscription });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    logger.error("Failed to create subscription", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Get a subscription by ID */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const subscription = await db("subscriptions")
      .where({ id: req.params.id, user_id: userId })
      .first();

    if (!subscription) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }

    const plan = await db("plans").where({ id: subscription.plan_id }).first();
    res.json({ subscription: { ...subscription, plan } });
  } catch (error) {
    logger.error("Failed to fetch subscription", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Update a subscription (change plan or interval) */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const body = UpdateSubscriptionSchema.parse(req.body);

    const subscription = await db("subscriptions")
      .where({ id: req.params.id, user_id: userId, status: "active" })
      .first();

    if (!subscription) {
      res.status(404).json({ error: "Active subscription not found" });
      return;
    }

    await payments.subscriptions.update(subscription.external_id, {
      priceAmount: body.planId
        ? (await db("plans").where({ id: body.planId }).first())?.monthly_price
        : undefined,
      interval: body.interval,
    });

    const [updated] = await db("subscriptions")
      .where({ id: req.params.id })
      .update({
        plan_id: body.planId ?? subscription.plan_id,
        interval: body.interval ?? subscription.interval,
        updated_at: new Date(),
      })
      .returning("*");

    logger.info("Subscription updated", { subscriptionId: updated.id });
    res.json({ subscription: updated });
  } catch (error) {
    logger.error("Failed to update subscription", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Cancel a subscription */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const subscription = await db("subscriptions")
      .where({ id: req.params.id, user_id: userId, status: "active" })
      .first();

    if (!subscription) {
      res.status(404).json({ error: "Active subscription not found" });
      return;
    }

    await payments.subscriptions.cancel(subscription.external_id, {
      cancelAtPeriodEnd: true,
    });

    const [cancelled] = await db("subscriptions")
      .where({ id: req.params.id })
      .update({ status: "cancelling", updated_at: new Date() })
      .returning("*");

    logger.info("Subscription cancelled", { subscriptionId: cancelled.id });
    res.json({ subscription: cancelled });
  } catch (error) {
    logger.error("Failed to cancel subscription", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as subscriptionRouter };
