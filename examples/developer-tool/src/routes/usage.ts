import { Router, type Request, type Response } from "express";
import { db } from "@devlaunchkit/database";
import { getCache, setCache } from "@devlaunchkit/cache";
import { createLogger } from "@devlaunchkit/logger";

const router = Router();
const logger = createLogger({ service: "usage" });

/** Get usage statistics for an API key or all keys */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { keyId, period = "24h" } = req.query;

    const hours = period === "7d" ? 168 : period === "30d" ? 720 : 24;
    const startDate = new Date(Date.now() - hours * 3600000);

    const cacheKey = `usage:${keyId ?? "all"}:${period}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const baseQuery = db("request_logs").where("created_at", ">=", startDate);
    if (keyId) {
      baseQuery.where({ api_key_id: keyId });
    }

    const [totalRequests] = await baseQuery.clone().count("* as count");
    const [errorRequests] = await baseQuery
      .clone()
      .where("status_code", ">=", 400)
      .count("* as count");

    const avgLatency = await baseQuery
      .clone()
      .avg("duration_ms as avg")
      .first();

    const p95Latency = await baseQuery
      .clone()
      .select(db.raw("PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95"))
      .first();

    const hourlyBreakdown = await baseQuery
      .clone()
      .select(db.raw("DATE_TRUNC('hour', created_at) as hour"))
      .count("* as requests")
      .groupByRaw("DATE_TRUNC('hour', created_at)")
      .orderByRaw("DATE_TRUNC('hour', created_at)");

    const topEndpoints = await baseQuery
      .clone()
      .select("path")
      .count("* as requests")
      .avg("duration_ms as avg_latency")
      .groupBy("path")
      .orderBy("requests", "desc")
      .limit(10);

    const statusDistribution = await baseQuery
      .clone()
      .select(db.raw("FLOOR(status_code / 100) * 100 as status_group"))
      .count("* as count")
      .groupByRaw("FLOOR(status_code / 100) * 100")
      .orderBy("status_group");

    const total = Number(totalRequests?.count ?? 0);
    const errors = Number(errorRequests?.count ?? 0);

    const result = {
      period,
      summary: {
        totalRequests: total,
        errorRequests: errors,
        successRate: total > 0 ? `${(((total - errors) / total) * 100).toFixed(2)}%` : "N/A",
        avgLatencyMs: Math.round(Number(avgLatency?.avg ?? 0)),
        p95LatencyMs: Math.round(Number((p95Latency as any)?.p95 ?? 0)),
      },
      hourlyBreakdown,
      topEndpoints,
      statusDistribution: statusDistribution.map((row: any) => ({
        group: `${row.status_group}`,
        count: Number(row.count),
      })),
      generatedAt: new Date().toISOString(),
    };

    await setCache(cacheKey, JSON.stringify(result), 60);
    res.json(result);
  } catch (error) {
    logger.error("Failed to fetch usage statistics", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as usageRouter };
