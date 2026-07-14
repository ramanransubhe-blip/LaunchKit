import { Router, type Request, type Response } from "express";
import { db } from "@devlaunchkit/database";
import { getCache, setCache } from "@devlaunchkit/cache";
import { createLogger } from "@devlaunchkit/logger";

const router = Router();
const logger = createLogger({ service: "metrics" });

const CACHE_TTL_SECONDS = 30;

/** System metrics — CPU, memory, uptime, and event loop latency */
router.get("/system", async (_req: Request, res: Response) => {
  try {
    const cached = await getCache("metrics:system");
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics = {
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000),
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      timestamp: new Date().toISOString(),
    };

    await setCache("metrics:system", JSON.stringify(metrics), CACHE_TTL_SECONDS);
    res.json(metrics);
  } catch (error) {
    logger.error("Failed to collect system metrics", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Business KPI metrics — users, revenue, subscriptions, churn */
router.get("/business", async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || "30d";
    const cacheKey = `metrics:business:${period}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const daysBack = parseInt(period) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [totalUsers] = await db("users").count("* as count");
    const [newUsers] = await db("users")
      .where("created_at", ">=", startDate)
      .count("* as count");

    const [activeSubs] = await db("subscriptions")
      .where({ status: "active" })
      .count("* as count");

    const [cancelledSubs] = await db("subscriptions")
      .where({ status: "cancelled" })
      .where("cancelled_at", ">=", startDate)
      .count("* as count");

    const revenue = await db("invoices")
      .where({ status: "paid" })
      .where("paid_at", ">=", startDate)
      .sum("amount as total")
      .first();

    const dailyRevenue = await db("invoices")
      .where({ status: "paid" })
      .where("paid_at", ">=", startDate)
      .select(db.raw("DATE(paid_at) as date"))
      .sum("amount as revenue")
      .groupByRaw("DATE(paid_at)")
      .orderByRaw("DATE(paid_at)");

    const totalActive = Number(activeSubs?.count ?? 0);
    const totalCancelled = Number(cancelledSubs?.count ?? 0);
    const churnRate = totalActive > 0
      ? ((totalCancelled / (totalActive + totalCancelled)) * 100).toFixed(2)
      : "0.00";

    const metrics = {
      period,
      users: {
        total: Number(totalUsers?.count ?? 0),
        new: Number(newUsers?.count ?? 0),
      },
      subscriptions: {
        active: totalActive,
        cancelled: totalCancelled,
        churnRate: `${churnRate}%`,
      },
      revenue: {
        total: Number(revenue?.total ?? 0),
        daily: dailyRevenue,
      },
      timestamp: new Date().toISOString(),
    };

    await setCache(cacheKey, JSON.stringify(metrics), CACHE_TTL_SECONDS * 2);
    res.json(metrics);
  } catch (error) {
    logger.error("Failed to collect business metrics", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as metricsRouter };
