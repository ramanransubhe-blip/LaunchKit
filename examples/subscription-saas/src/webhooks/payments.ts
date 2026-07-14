import { Router, type Request, type Response } from "express";
import { createPaymentClient } from "@devlaunchkit/payments";
import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";
import { sendEmail } from "@devlaunchkit/communication";

const router = Router();
const logger = createLogger({ service: "webhooks" });
const payments = createPaymentClient({ provider: "dodo" });

/**
 * Dodo Payments webhook handler.
 * Processes subscription lifecycle events and invoice updates.
 */
router.post("/dodo", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-dodo-signature"] as string;
    if (!signature) {
      res.status(401).json({ error: "Missing webhook signature" });
      return;
    }

    const event = payments.webhooks.verify(req.body, signature);
    logger.info("Webhook received", { type: event.type, id: event.id });

    switch (event.type) {
      case "subscription.activated": {
        const { subscriptionId, customerId } = event.data;
        await db("subscriptions")
          .where({ external_id: subscriptionId })
          .update({ status: "active", updated_at: new Date() });

        const user = await db("users").where({ id: customerId }).first();
        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: "Your subscription is now active",
            template: "subscription-activated",
            data: { name: user.name, subscriptionId },
          });
        }
        break;
      }

      case "subscription.cancelled": {
        const { subscriptionId } = event.data;
        await db("subscriptions")
          .where({ external_id: subscriptionId })
          .update({ status: "cancelled", cancelled_at: new Date(), updated_at: new Date() });
        break;
      }

      case "subscription.renewed": {
        const { subscriptionId, periodStart, periodEnd } = event.data;
        await db("subscriptions")
          .where({ external_id: subscriptionId })
          .update({
            current_period_start: new Date(periodStart),
            current_period_end: new Date(periodEnd),
            updated_at: new Date(),
          });
        break;
      }

      case "invoice.paid": {
        const { invoiceId, subscriptionId, amount, currency } = event.data;
        const subscription = await db("subscriptions")
          .where({ external_id: subscriptionId })
          .first();

        if (subscription) {
          await db("invoices").insert({
            external_id: invoiceId,
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            amount,
            currency,
            status: "paid",
            paid_at: new Date(),
            created_at: new Date(),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const { subscriptionId, attemptCount } = event.data;
        const subscription = await db("subscriptions")
          .where({ external_id: subscriptionId })
          .first();

        if (subscription) {
          await db("subscriptions")
            .where({ id: subscription.id })
            .update({ status: "past_due", updated_at: new Date() });

          const user = await db("users").where({ id: subscription.user_id }).first();
          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: "Payment failed — action required",
              template: "payment-failed",
              data: {
                name: user.name,
                attemptCount,
                updatePaymentUrl: `${process.env.APP_URL}/billing/payment-method`,
              },
            });
          }
        }
        break;
      }

      default:
        logger.warn("Unhandled webhook event", { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", { error });
    res.status(400).json({ error: "Webhook processing failed" });
  }
});

export { router as webhookRouter };
