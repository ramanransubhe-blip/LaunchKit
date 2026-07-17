/**
 * @module @devlaunchkit/example-ai-saas
 * @description Main server entrypoint for the AI Chat & Image Generation SaaS.
 *
 * Bootstraps a Hono HTTP server with authentication middleware, rate limiting,
 * and routes for chat completions and image generation.
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";

import { setGlobalAIService } from "@devlaunchkit/ai";
import { RateLimiter } from "@devlaunchkit/rate-limit";

import { authMiddleware, type AuthEnv } from "./middleware/auth.js";
import { chatRouter } from "./routes/chat.js";
import { imagesRouter } from "./routes/images.js";

// ---------------------------------------------------------------------------
// Environment & Configuration
// ---------------------------------------------------------------------------

/** Validated server configuration loaded from environment variables. */
interface ServerConfig {
  readonly port: number;
  readonly nodeEnv: string;
  readonly databaseUrl: string;
  readonly openaiApiKey: string;
  readonly stripeSecretKey: string;
  readonly betterAuthSecret: string;
}

/**
 * Reads and validates all required environment variables at startup.
 * Throws with a descriptive message if any required variable is missing.
 */
function loadConfig(): ServerConfig {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  };

  return {
    port: parseInt(process.env.PORT ?? "3000", 10),
    nodeEnv: process.env.NODE_ENV ?? "development",
    databaseUrl: required("DATABASE_URL"),
    openaiApiKey: required("OPENAI_API_KEY"),
    stripeSecretKey: required("STRIPE_SECRET_KEY"),
    betterAuthSecret: required("BETTER_AUTH_SECRET"),
  };
}

// ---------------------------------------------------------------------------
// Subscription Tier Rate-Limit Definitions
// ---------------------------------------------------------------------------

/** Rate limiters keyed by subscription tier with escalating quotas. */
const tierLimiters = {
  free: new RateLimiter(20, 60_000),
  pro: new RateLimiter(100, 60_000),
  enterprise: new RateLimiter(500, 60_000),
} as const;

export type SubscriptionTier = keyof typeof tierLimiters;

/**
 * Returns the appropriate rate limiter for a subscription tier.
 * Defaults to the free tier if the tier is unrecognized.
 */
export function getLimiterForTier(tier: string): RateLimiter {
  return tierLimiters[tier as SubscriptionTier] ?? tierLimiters.free;
}

// ---------------------------------------------------------------------------
// Application Bootstrap
// ---------------------------------------------------------------------------

const app = new Hono<AuthEnv>();

/**
 * Initializes all services and starts the HTTP server.
 *
 * @remarks
 * Service initialization order matters — the AI service must be registered
 * globally before any route handler invokes it.
 */
async function bootstrap(): Promise<void> {
  const config = loadConfig();

  // --- Global AI Service Registration ---
  // The OpenAI provider is set as the default; routes can override per-request.
  const { OpenAIService } = await import("@devlaunchkit/ai");
  const openai = new OpenAIService({ apiKey: config.openaiApiKey });
  setGlobalAIService(openai);

  // --- Middleware Stack ---
  app.use("*", honoLogger());
  app.use(
    "*",
    cors({
      origin:
        config.nodeEnv === "production"
          ? ["https://yourdomain.com"]
          : ["http://localhost:3000", "http://localhost:5173"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Authentication gate — all /api/* routes require a valid session
  app.use("/api/*", authMiddleware);

  // --- Route Registration ---
  app.route("/api/chat", chatRouter);
  app.route("/api/images", imagesRouter);

  // --- Health Check ---
  app.get("/health", (c) =>
    c.json({
      status: "healthy",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  );

  // --- Start Server ---
  serve({ fetch: app.fetch, port: config.port }, (info) => {
    console.log(`🤖 AI SaaS server running on http://localhost:${info.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start AI SaaS server:", err);
  process.exit(1);
});

export { app };
