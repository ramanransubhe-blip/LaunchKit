import express from "express";
import { createLogger } from "@devlaunchkit/logger";
import { db } from "@devlaunchkit/database";
import { initObservability } from "@devlaunchkit/observability";
import { metricsRouter } from "./routes/metrics.js";
import { healthRouter } from "./routes/health.js";

const logger = createLogger({ service: "internal-dashboard" });
const app = express();
const PORT = process.env.PORT ?? 4003;

/* ------------------------------------------------------------------ */
/*  Observability bootstrap                                            */
/* ------------------------------------------------------------------ */

initObservability({
  serviceName: "internal-dashboard",
  metricsEnabled: true,
  tracingEnabled: true,
});

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */

app.use(express.json());

/** Request logging middleware */
app.use((req, _res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

app.use("/api/metrics", metricsRouter);
app.use("/api/health", healthRouter);

/** Dashboard overview — aggregate stats for the internal operations UI */
app.get("/api/dashboard", async (_req, res) => {
  try {
    const [userCount] = await db("users").count("* as count");
    const [activeSubCount] = await db("subscriptions")
      .where({ status: "active" })
      .count("* as count");

    const revenueResult = await db("invoices")
      .where({ status: "paid" })
      .sum("amount as total")
      .first();

    const recentEvents = await db("audit_logs")
      .orderBy("created_at", "desc")
      .limit(10);

    res.json({
      overview: {
        totalUsers: Number(userCount?.count ?? 0),
        activeSubscriptions: Number(activeSubCount?.count ?? 0),
        totalRevenue: Number(revenueResult?.total ?? 0),
      },
      recentEvents,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Dashboard aggregation failed", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
  logger.info(`Internal Dashboard running on http://localhost:${PORT}`);
  logger.info("Routes:");
  logger.info("  GET  /api/dashboard             → Overview stats");
  logger.info("  GET  /api/metrics/system         → System metrics");
  logger.info("  GET  /api/metrics/business        → Business KPIs");
  logger.info("  GET  /api/health                 → Health checks");
  logger.info("  GET  /api/health/dependencies     → Dependency status");
});

export { app };
