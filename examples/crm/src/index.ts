/**
 * @module @devlaunchkit/example-crm
 * @description Main server entrypoint for the CRM application.
 *
 * Bootstraps a Hono HTTP server with Clerk authentication, role-based access
 * control, and routes for contacts, deals, and pipeline management.
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";

import { PermissionsManager, type Role } from "@devlaunchkit/permissions";

import { contactsRouter } from "./routes/contacts.js";
import { dealsRouter } from "./routes/deals.js";
import { pipelineRouter } from "./routes/pipeline.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** CRM-specific user context attached to authenticated requests. */
export interface CrmUserContext {
  readonly userId: string;
  readonly email: string;
  readonly orgId: string;
  readonly role: string;
}

/** Hono environment type augmented with CRM user context. */
export type CrmEnv = {
  Variables: {
    crmUser: CrmUserContext;
  };
};

// ---------------------------------------------------------------------------
// Permissions Configuration
// ---------------------------------------------------------------------------

/** CRM-specific permissions manager with custom role definitions. */
export const crmPermissions = new PermissionsManager();

// Register CRM-specific roles extending the defaults
const crmRoles: Role[] = [
  {
    name: "viewer",
    permissions: ["read:contacts", "read:deals", "read:pipeline"],
  },
  {
    name: "member",
    inherits: ["viewer"],
    permissions: [
      "write:contacts",
      "write:deals",
      "write:notes",
      "send:emails",
    ],
  },
  {
    name: "admin",
    inherits: ["member"],
    permissions: [
      "delete:contacts",
      "delete:deals",
      "write:pipeline",
      "manage:team",
      "view:analytics",
    ],
  },
  {
    name: "owner",
    inherits: ["admin"],
    permissions: ["all"],
  },
];

for (const role of crmRoles) {
  crmPermissions.registerRole(role);
}

// ---------------------------------------------------------------------------
// Application Setup
// ---------------------------------------------------------------------------

const app = new Hono<CrmEnv>();

/**
 * Initializes the CRM server with middleware and routes.
 *
 * @remarks
 * Authentication is simulated via headers for this example. In production,
 * replace the auth middleware with Clerk's SDK verification.
 */
async function bootstrap(): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);
  const nodeEnv = process.env.NODE_ENV ?? "development";

  // --- Middleware ---
  app.use("*", honoLogger());
  app.use("*", cors({
    origin: nodeEnv === "production"
      ? ["https://yourdomain.com"]
      : ["http://localhost:3000", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Org-Id"],
    credentials: true,
  }));

  /**
   * Authentication middleware — validates the Clerk session and resolves
   * the user's organization membership and role.
   *
   * In production, use `@clerk/backend` SDK to verify the session JWT.
   * This example reads from headers for local development convenience.
   */
  app.use("/api/*", async (c, next) => {
    const userId = c.req.header("X-User-Id");
    const email = c.req.header("X-User-Email");
    const orgId = c.req.header("X-Org-Id");
    const role = c.req.header("X-User-Role") ?? "viewer";

    if (!userId || !email || !orgId) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Provide X-User-Id, X-User-Email, and X-Org-Id headers.",
          },
        },
        401,
      );
    }

    c.set("crmUser", { userId, email, orgId, role });
    await next();
  });

  // --- Routes ---
  app.route("/api/contacts", contactsRouter);
  app.route("/api/deals", dealsRouter);
  app.route("/api/pipeline", pipelineRouter);

  // --- Health Check ---
  app.get("/health", (c) =>
    c.json({
      status: "healthy",
      service: "crm",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );

  // --- Start Server ---
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`📇 CRM server running on http://localhost:${info.port}`);
    console.log(`   Environment: ${nodeEnv}`);
    console.log(`   Registered roles: ${crmRoles.map((r) => r.name).join(", ")}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start CRM server:", err);
  process.exit(1);
});

export { app };
