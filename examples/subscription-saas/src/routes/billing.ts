import { Router, type Request, type Response } from "express";
import { createDodoBillingService } from "@devlaunchkit/payments";
import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";

const router = Router();
const logger = createLogger({ service: "billing" });
const payments = createDodoBillingService({
  apiKey: process.env.DODO_API_KEY,
  isMock: !process.env.DODO_API_KEY || process.env.NODE_ENV === "development",
});

/** List all invoices for the authenticated user */
router.get("/invoices", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const invoices = await db("invoices")
      .where({ user_id: userId })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db("invoices").where({ user_id: userId }).count("* as count");

    res.json({
      invoices,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch invoices", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Get a single invoice with line items */
router.get("/invoices/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const invoice = await db("invoices").where({ id: req.params.id, user_id: userId }).first();

    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }

    const lineItems = await db("invoice_line_items").where({ invoice_id: invoice.id });

    res.json({ invoice: { ...invoice, lineItems } });
  } catch (error) {
    logger.error("Failed to fetch invoice", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Update the default payment method */
router.post("/payment-method", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId || typeof paymentMethodId !== "string") {
      res.status(400).json({ error: "paymentMethodId is required" });
      return;
    }

    await payments.updateCustomer(userId, {
      metadata: { paymentMethodId },
    });

    await db("users").where({ id: userId }).update({
      default_payment_method: paymentMethodId,
      updated_at: new Date(),
    });

    logger.info("Payment method updated", { userId });
    res.json({ message: "Payment method updated successfully" });
  } catch (error) {
    logger.error("Failed to update payment method", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Get current billing summary */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const subscription = await db("subscriptions")
      .where({ user_id: userId, status: "active" })
      .first();

    const plan = subscription
      ? await db("plans").where({ id: subscription.plan_id }).first()
      : null;

    const recentInvoices = await db("invoices")
      .where({ user_id: userId })
      .orderBy("created_at", "desc")
      .limit(3);

    const totalSpent = await db("invoices")
      .where({ user_id: userId, status: "paid" })
      .sum("amount as total")
      .first();

    res.json({
      currentPlan: plan?.name ?? "Free",
      subscription: subscription ?? null,
      nextBillingDate: subscription?.current_period_end ?? null,
      recentInvoices,
      totalSpent: Number(totalSpent?.total ?? 0),
    });
  } catch (error) {
    logger.error("Failed to fetch billing summary", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as billingRouter };
