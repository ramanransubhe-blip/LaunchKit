import { db } from "@devlaunchkit/database";
import { getCache, setCache } from "@devlaunchkit/cache";
import { createLogger } from "@devlaunchkit/logger";
import { enqueue } from "@devlaunchkit/queue";

const logger = createLogger({ service: "aggregator-worker" });

interface AggregationResult {
  metric: string;
  value: number;
  period: string;
  computed_at: Date;
}

/**
 * Background worker that computes hourly metric aggregations.
 * Designed to run as a standalone process via `pnpm worker`.
 */
async function runAggregation(): Promise<void> {
  logger.info("Starting metric aggregation cycle");

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const period = oneHourAgo.toISOString().slice(0, 13); // YYYY-MM-DDTHH

  try {
    /** Aggregate user signups in the last hour */
    const [signups] = await db("users")
      .where("created_at", ">=", oneHourAgo)
      .where("created_at", "<", now)
      .count("* as count");

    /** Aggregate revenue in the last hour */
    const revenueResult = await db("invoices")
      .where({ status: "paid" })
      .where("paid_at", ">=", oneHourAgo)
      .where("paid_at", "<", now)
      .sum("amount as total")
      .first();

    /** Aggregate API requests from the logs table */
    const [apiRequests] = await db("request_logs")
      .where("created_at", ">=", oneHourAgo)
      .where("created_at", "<", now)
      .count("* as count");

    /** Aggregate error count */
    const [errorCount] = await db("request_logs")
      .where("created_at", ">=", oneHourAgo)
      .where("created_at", "<", now)
      .where("status_code", ">=", 500)
      .count("* as count");

    const aggregations: AggregationResult[] = [
      { metric: "hourly_signups", value: Number(signups?.count ?? 0), period, computed_at: now },
      {
        metric: "hourly_revenue",
        value: Number(revenueResult?.total ?? 0),
        period,
        computed_at: now,
      },
      {
        metric: "hourly_api_requests",
        value: Number(apiRequests?.count ?? 0),
        period,
        computed_at: now,
      },
      { metric: "hourly_errors", value: Number(errorCount?.count ?? 0), period, computed_at: now },
    ];

    /** Upsert aggregation results */
    for (const agg of aggregations) {
      await db("metric_aggregations")
        .insert(agg)
        .onConflict(["metric", "period"])
        .merge({ value: agg.value, computed_at: agg.computed_at });
    }

    /** Cache the latest aggregations for quick dashboard reads */
    await setCache("dashboard:latest-aggregations", JSON.stringify(aggregations), 3600);

    const totalApiRequests = Number(apiRequests?.count ?? 0);
    const totalErrors = Number(errorCount?.count ?? 0);
    const errorRate =
      totalApiRequests > 0 ? ((totalErrors / totalApiRequests) * 100).toFixed(2) : "0.00";

    /** If error rate exceeds threshold, enqueue an alert job */
    if (parseFloat(errorRate) > 5.0) {
      await enqueue("alerts", {
        type: "high_error_rate",
        errorRate,
        period,
        timestamp: now.toISOString(),
      });
      logger.warn("High error rate detected — alert enqueued", { errorRate, period });
    }

    logger.info("Aggregation cycle complete", {
      period,
      metrics: aggregations.map((a) => `${a.metric}=${a.value}`),
    });
  } catch (error) {
    logger.error("Aggregation cycle failed", { error, period });
    throw error;
  }
}

/** Run on interval — every 60 seconds for near-real-time dashboards */
const INTERVAL_MS = 60_000;

async function main(): Promise<void> {
  logger.info("Aggregator worker started", { intervalMs: INTERVAL_MS });

  const tick = async () => {
    try {
      await runAggregation();
    } catch {
      logger.error("Aggregation tick failed — will retry next interval");
    }
  };

  await tick();
  setInterval(tick, INTERVAL_MS);
}

main().catch((error) => {
  logger.error("Aggregator worker crashed", { error });
  process.exit(1);
});
