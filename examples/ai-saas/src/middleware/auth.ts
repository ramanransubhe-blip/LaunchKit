/**
 * @module middleware/auth
 * @description Authentication & authorization middleware using Better Auth.
 *
 * Validates session tokens from the Authorization header, resolves the
 * authenticated user, and attaches user context to the Hono request
 * environment for downstream route handlers.
 */

import type { Context, MiddlewareHandler } from "hono";
import type { AuthService, AuthUser, AuthSession } from "@devlaunchkit/auth";
import {
  getGlobalBillingService,
  type BillingSubscription,
  SubscriptionStatus,
} from "@devlaunchkit/payments";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Authenticated user context attached to every protected request. */
export interface UserContext {
  readonly user: AuthUser;
  readonly session: AuthSession;
  readonly subscription: BillingSubscription | null;
  /** Resolved tier name derived from the active subscription. */
  readonly tier: "free" | "pro" | "enterprise";
}

/** Hono environment type augmented with the user context. */
export type AuthEnv = {
  Variables: {
    userContext: UserContext;
  };
};

// ---------------------------------------------------------------------------
// Tier Resolution
// ---------------------------------------------------------------------------

/** Maps Stripe price IDs to human-readable tier names. */
const PRICE_TO_TIER: Record<string, "pro" | "enterprise"> = {
  [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
  [process.env.STRIPE_PRICE_ENTERPRISE ?? ""]: "enterprise",
};

/**
 * Determines the subscription tier from an active billing subscription.
 *
 * @param subscription - The current billing subscription, or null for free tier.
 * @returns The resolved tier name.
 */
function resolveTier(subscription: BillingSubscription | null): "free" | "pro" | "enterprise" {
  if (!subscription || subscription.status !== SubscriptionStatus.Active) {
    return "free";
  }
  return PRICE_TO_TIER[subscription.priceId] ?? "free";
}

// ---------------------------------------------------------------------------
// Token Extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the bearer token from the Authorization header.
 *
 * @param c - The Hono context object.
 * @returns The extracted token string, or null if not present.
 */
function extractBearerToken(c: Context): string | null {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice(7).trim();
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Hono middleware that enforces authentication on protected routes.
 *
 * Validates the bearer token via the auth service, resolves the user's
 * subscription tier, and sets the `userContext` variable for downstream
 * handlers. Returns a 401 response if the token is missing or invalid.
 *
 * @example
 * ```ts
 * app.use("/api/*", authMiddleware);
 *
 * app.get("/api/me", (c) => {
 *   const { user, tier } = c.get("userContext");
 *   return c.json({ email: user.email, tier });
 * });
 * ```
 */
export const authMiddleware: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const token = extractBearerToken(c);

  if (!token) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Missing authentication token" } },
      401
    );
  }

  try {
    // Dynamically import the auth factory to allow lazy initialization
    const { getGlobalAuthService } = await import("@devlaunchkit/auth");
    const authService: AuthService = getGlobalAuthService();

    // Validate the session token
    const session = await authService.getSession(token);
    if (!session) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired session" } },
        401
      );
    }

    // Resolve the full user record
    const user = await authService.getUser(session.userId);
    if (!user) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User account not found" } },
        401
      );
    }

    // Fetch subscription status for tier-based rate limiting
    let subscription: BillingSubscription | null = null;
    try {
      const billing = getGlobalBillingService();
      const customerId = (user.metadata as Record<string, string>)?.stripeCustomerId;
      if (customerId) {
        subscription = await billing.getSubscription(customerId);
      }
    } catch {
      // Billing unavailable — default to free tier
    }

    const tier = resolveTier(subscription);

    // Attach context for downstream handlers
    c.set("userContext", { user, session, subscription, tier });

    await next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return c.json({ success: false, error: { code: "AUTH_ERROR", message } }, 500);
  }
};
