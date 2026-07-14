import express from "express";
import { createLogger } from "@devlaunchkit/logger";
import { db } from "@devlaunchkit/database";
import { keysRouter } from "./routes/keys.js";
import { usageRouter } from "./routes/usage.js";
import { rateLimitMiddleware } from "./middleware/rate-limit.js";

const logger = createLogger({ service: "developer-tool" });
const app = express();
const PORT = process.env.PORT ?? 4004;

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */

app.use(express.json());

/** Request logging */
app.use((req, _res, next) => {
  const start = performance.now();
  const originalEnd = _res.end.bind(_res);

  _res.end = function (...args: Parameters<typeof originalEnd>) {
    const duration = Math.round(performance.now() - start);
    logger.info("Request completed", {
      method: req.method,
      path: req.path,
      status: _res.statusCode,
      durationMs: duration,
      apiKey: req.headers["x-api-key"] ? "***" : undefined,
    });

    db("request_logs")
      .insert({
        method: req.method,
        path: req.path,
        status_code: _res.statusCode,
        duration_ms: duration,
        api_key_id: (req as any).apiKeyId ?? null,
        ip_address: req.ip,
        created_at: new Date(),
      })
      .catch((err: unknown) => logger.warn("Failed to log request", { error: err }));

    return originalEnd(...args);
  } as typeof originalEnd;

  next();
});

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

/** API key management — no rate limiting */
app.use("/api/keys", keysRouter);

/** Usage analytics — no rate limiting */
app.use("/api/usage", usageRouter);

/** Example protected API endpoint with tiered rate limiting */
app.use("/api/v1/*", rateLimitMiddleware);

app.get("/api/v1/echo", (req, res) => {
  res.json({
    message: "Echo response",
    timestamp: new Date().toISOString(),
    headers: {
      userAgent: req.headers["user-agent"],
      apiKey: req.headers["x-api-key"] ? "present" : "missing",
    },
  });
});

app.post("/api/v1/transform", (req, res) => {
  const { data, format } = req.body;
  if (!data) {
    res.status(400).json({ error: "data field is required" });
    return;
  }

  const result =
    format === "uppercase"
      ? String(data).toUpperCase()
      : format === "lowercase"
        ? String(data).toLowerCase()
        : format === "reverse"
          ? String(data).split("").reverse().join("")
          : data;

  res.json({ result, format: format ?? "identity", timestamp: new Date().toISOString() });
});

/** Health check */
app.get("/health", async (_req, res) => {
  try {
    await db.raw("SELECT 1");
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
  logger.info(`Developer Tool API running on http://localhost:${PORT}`);
  logger.info("Routes:");
  logger.info("  POST /api/keys                → Create API key");
  logger.info("  GET  /api/keys                → List API keys");
  logger.info("  DELETE /api/keys/:id           → Revoke API key");
  logger.info("  GET  /api/usage               → Usage statistics");
  logger.info("  GET  /api/v1/echo             → Echo endpoint (rate limited)");
  logger.info("  POST /api/v1/transform         → Transform endpoint (rate limited)");
});

export { app };
