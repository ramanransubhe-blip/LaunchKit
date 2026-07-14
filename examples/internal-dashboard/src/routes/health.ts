import { Router, type Request, type Response } from "express";
import { db } from "@devlaunchkit/database";
import { getCache } from "@devlaunchkit/cache";
import { createLogger } from "@devlaunchkit/logger";

const router = Router();
const logger = createLogger({ service: "health" });

interface DependencyCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  message?: string;
}

/** Overall health status */
router.get("/", async (_req: Request, res: Response) => {
  const checks = await runDependencyChecks();
  const allHealthy = checks.every((c) => c.status === "healthy");
  const anyUnhealthy = checks.some((c) => c.status === "unhealthy");

  const status = anyUnhealthy ? "unhealthy" : allHealthy ? "healthy" : "degraded";
  const httpStatus = anyUnhealthy ? 503 : 200;

  res.status(httpStatus).json({
    status,
    version: process.env.npm_package_version ?? "1.0.0",
    uptime: process.uptime(),
    checks,
    timestamp: new Date().toISOString(),
  });
});

/** Detailed dependency health checks */
router.get("/dependencies", async (_req: Request, res: Response) => {
  const checks = await runDependencyChecks();
  res.json({ dependencies: checks, timestamp: new Date().toISOString() });
});

async function runDependencyChecks(): Promise<DependencyCheck[]> {
  const checks: DependencyCheck[] = [];

  /** PostgreSQL check */
  const dbStart = performance.now();
  try {
    await db.raw("SELECT 1");
    checks.push({
      name: "postgresql",
      status: "healthy",
      latencyMs: Math.round(performance.now() - dbStart),
    });
  } catch (error) {
    checks.push({
      name: "postgresql",
      status: "unhealthy",
      latencyMs: Math.round(performance.now() - dbStart),
      message: error instanceof Error ? error.message : "Connection failed",
    });
  }

  /** Redis check */
  const redisStart = performance.now();
  try {
    await getCache("health:ping");
    checks.push({
      name: "redis",
      status: "healthy",
      latencyMs: Math.round(performance.now() - redisStart),
    });
  } catch (error) {
    checks.push({
      name: "redis",
      status: "degraded",
      latencyMs: Math.round(performance.now() - redisStart),
      message: error instanceof Error ? error.message : "Connection failed",
    });
  }

  return checks;
}

export { healthRouter } from "./health.js";
export { router as healthRouter };
