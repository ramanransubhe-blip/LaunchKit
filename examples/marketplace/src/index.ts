/**
 * @module marketplace
 * @description Multi-Vendor Marketplace — Application entry point.
 *
 * Bootstraps the Hono HTTP server with authentication middleware, feature flag
 * evaluation, structured logging, and all route modules for products, orders,
 * and vendor management.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { logger } from "@devlaunchkit/logger";
import { featureFlags, type FeatureFlag } from "@devlaunchkit/feature-flags";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { vendorsRouter } from "./routes/vendors.js";
import { createPaymentService } from "./services/payments.js";
import { createSearchService } from "./services/search.js";

// ---------------------------------------------------------------------------
// Environment configuration
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT || "4500", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

// ---------------------------------------------------------------------------
// Feature flag registration
// ---------------------------------------------------------------------------

/** Registers the default marketplace feature flags at startup. */
function registerFeatureFlags(): void {
  const flags: FeatureFlag[] = [
    {
      key: "marketplace.instant-checkout",
      isEnabled: true,
      percentageRollout: 50,
      environments: ["production", "staging"],
    },
    {
      key: "marketplace.vendor-analytics-v2",
      isEnabled: true,
      percentageRollout: 25,
      environments: ["production"],
    },
    {
      key: "marketplace.ai-recommendations",
      isEnabled: NODE_ENV !== "production",
      environments: ["development", "staging"],
    },
    {
      key: "marketplace.multi-currency",
      isEnabled: true,
      percentageRollout: 10,
    },
  ];

  for (const flag of flags) {
    featureFlags.setFlag(flag);
  }

  logger.info("Feature flags registered", { count: flags.length });
}

// ---------------------------------------------------------------------------
// Application type declarations
// ---------------------------------------------------------------------------

/** Shared application context injected into every request via Hono variables. */
export interface AppContext {
  Variables: {
    userId: string | null;
    userRole: "buyer" | "vendor" | "admin" | "anonymous";
    vendorId: string | null;
  };
}

// ---------------------------------------------------------------------------
// Application factory
// ---------------------------------------------------------------------------

function createApp(): Hono<AppContext> {
  const app = new Hono<AppContext>();

  // ---------- Global middleware ----------

  app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }));
  app.use("*", honoLogger());

  // Authentication middleware — extracts user identity from the Authorization header.
  app.use("/api/*", async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      c.set("userId", null);
      c.set("userRole", "anonymous");
      c.set("vendorId", null);
      return next();
    }

    const token = authHeader.slice(7);

    try {
      // In production this calls Clerk's verifyToken; here we decode a
      // simplified JWT-like structure for demonstration purposes.
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1] ?? "{}", "base64url").toString("utf-8"),
      );

      c.set("userId", payload.sub ?? null);
      c.set("userRole", payload.role ?? "buyer");
      c.set("vendorId", payload.vendorId ?? null);
    } catch {
      c.set("userId", null);
      c.set("userRole", "anonymous");
      c.set("vendorId", null);
    }

    return next();
  });

  // ---------- Health check ----------

  app.get("/health", (c) =>
    c.json({
      status: "healthy",
      service: "marketplace",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    }),
  );

  // ---------- Route modules ----------

  app.route("/api/products", productsRouter);
  app.route("/api/orders", ordersRouter);
  app.route("/api/vendors", vendorsRouter);

  // ---------- Stripe webhook receiver ----------

  const paymentService = createPaymentService();

  app.post("/api/webhooks/stripe", async (c) => {
    const rawBody = await c.req.text();
    const signature = c.req.header("stripe-signature") ?? "";

    try {
      const event = await paymentService.handleWebhook(rawBody, signature);
      logger.info("Stripe webhook processed", { eventType: event.type, eventId: event.id });
      return c.json({ received: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Stripe webhook failed", { error: message });
      return c.json({ error: "Webhook verification failed" }, 400);
    }
  });

  // ---------- Global error handler ----------

  app.onError((err, c) => {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    const status = (err as any).status ?? 500;
    logger.error("Unhandled request error", { path: c.req.path, method: c.req.method, error: message });
    return c.json({ error: message }, status);
  });

  // ---------- 404 fallback ----------

  app.notFound((c) =>
    c.json({ error: "Not Found", path: c.req.path }, 404),
  );

  return app;
}

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  registerFeatureFlags();

  const searchService = createSearchService();
  await searchService.initialize();

  const app = createApp();

  logger.info(`🏪 Marketplace server starting`, { port: PORT, environment: NODE_ENV });

  const server = Bun?.serve?.({ port: PORT, fetch: app.fetch })
    ?? (await import("node:http")).createServer(async (req, res) => {
      // Fallback Node.js HTTP server for non-Bun runtimes
      const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
      const headers = new Headers();
      for (const [key, val] of Object.entries(req.headers)) {
        if (val) headers.set(key, Array.isArray(val) ? val.join(", ") : val);
      }
      const body = ["GET", "HEAD"].includes(req.method ?? "GET")
        ? undefined
        : await new Promise<string>((resolve) => {
            let data = "";
            req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
            req.on("end", () => resolve(data));
          });
      const request = new Request(url.toString(), { method: req.method, headers, body });
      const response = await app.fetch(request);
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      const text = await response.text();
      res.end(text);
    }).listen(PORT);

  logger.info(`🏪 Marketplace server listening on http://localhost:${PORT}`);

  // Graceful shutdown
  const shutdown = (): void => {
    logger.info("Shutting down marketplace server…");
    if ("close" in server) (server as any).close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.fatal("Failed to start marketplace server", err);
  process.exit(1);
});
