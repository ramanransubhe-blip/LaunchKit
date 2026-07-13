import { logger } from "@devlaunchkit/logger";

export type HealthStatus = "healthy" | "unhealthy" | "degraded";

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  error?: string;
}

export type HealthCheckFn = () => Promise<Omit<HealthCheckResult, "name">>;

class ObservabilityManager {
  private healthChecks = new Map<string, HealthCheckFn>();
  private startTime = Date.now();

  // Register a diagnostic check
  registerCheck(name: string, checkFn: HealthCheckFn): void {
    this.healthChecks.set(name, checkFn);
  }

  // Run all registered diagnostic checks
  async runHealthChecks(): Promise<{
    status: HealthStatus;
    uptimeSeconds: number;
    checks: HealthCheckResult[];
  }> {
    const checks: HealthCheckResult[] = [];
    let overallStatus: HealthStatus = "healthy";

    for (const [name, checkFn] of this.healthChecks.entries()) {
      try {
        const start = Date.now();
        const result = await checkFn();
        const latencyMs = Date.now() - start;

        checks.push({
          name,
          ...result,
          latencyMs: result.latencyMs ?? latencyMs,
        });

        if (result.status === "unhealthy") {
          overallStatus = "unhealthy";
        } else if (result.status === "degraded" && overallStatus !== "unhealthy") {
          overallStatus = "degraded";
        }
      } catch (err: any) {
        overallStatus = "unhealthy";
        checks.push({
          name,
          status: "unhealthy",
          error: err.message || String(err),
        });
      }
    }

    return {
      status: overallStatus,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
    };
  }

  // Request/Performance Timing Helper (High-resolution timer)
  startTimer(): () => number {
    const start = process.hrtime();
    return () => {
      const diff = process.hrtime(start);
      // Converts high-resolution nanoseconds/seconds to float milliseconds
      return (diff[0] * 1e9 + diff[1]) / 1e6;
    };
  }

  // Simple trace logger wrapper
  async trace<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const endTimer = this.startTimer();
    try {
      const result = await fn();
      const duration = endTimer();
      logger.debug(`[Trace] ${name} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (err) {
      const duration = endTimer();
      logger.error(`[Trace] ${name} failed after ${duration.toFixed(2)}ms`, err);
      throw err;
    }
  }
}

export const observability = new ObservabilityManager();
export default observability;
