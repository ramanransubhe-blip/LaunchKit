import express from "express";
import { createLogger } from "@devlaunchkit/logger";
import { initAuth, requireAuth } from "@devlaunchkit/auth";
import { db } from "@devlaunchkit/database";
import { subscriptionRouter } from "./routes/subscriptions.js";
import { billingRouter } from "./routes/billing.js";
import { webhookRouter } from "./webhooks/payments.js";

const logger = createLogger({ service: "subscription-saas" });
const app = express();
const PORT = process.env.PORT ?? 4002;

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */

/** Raw body required for webhook signature verification */
app.use("/webhooks", express.raw({ type: "application/json" }));
app.use(express.json());

/** Initialize Better Auth session middleware */
const auth = initAuth({
  provider: "better-auth",
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
});
app.use(auth.middleware);

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

app.use("/api/subscriptions", requireAuth(), subscriptionRouter);
app.use("/api/billing", requireAuth(), billingRouter);
app.use("/webhooks", webhookRouter);

/** Health check */
app.get("/health", async (_req, res) => {
  try {
    await db.raw("SELECT 1");
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error("Health check failed", { error });
    res.status(503).json({ status: "unhealthy" });
  }
});

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
  logger.info(`Subscription SaaS running on http://localhost:${PORT}`);
  logger.info("Routes:");
  logger.info("  POST /api/subscriptions          → Create subscription");
  logger.info("  GET  /api/subscriptions/:id       → Get subscription");
  logger.info("  PATCH /api/subscriptions/:id      → Update subscription");
  logger.info("  DELETE /api/subscriptions/:id      → Cancel subscription");
  logger.info("  GET  /api/billing/invoices         → List invoices");
  logger.info("  POST /api/billing/payment-method   → Update payment method");
  logger.info("  POST /webhooks/dodo               → Dodo payment webhooks");
});

export { app };
