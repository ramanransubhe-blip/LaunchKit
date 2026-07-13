import { logger } from "@devlaunchkit/logger";
import { AuthenticationError, AuthorizationError, RateLimitError, APIError } from "@devlaunchkit/errors";
import { apiRateLimiter } from "@devlaunchkit/rate-limit";
import { featureFlags } from "@devlaunchkit/feature-flags";
import { permissions } from "@devlaunchkit/permissions";
import { generateNonce, generateCspHeader } from "@devlaunchkit/security";

// 1. Request Timing & Logging Middleware Helper
export async function withLogging(req: Request, handler: () => Promise<Response>): Promise<Response> {
  const start = Date.now();
  const url = new URL(req.url);
  const requestId = req.headers.get("x-request-id") || Math.random().toString(36).substring(2, 9);
  
  logger.info(`🛫 Request started: ${req.method} ${url.pathname}`, { requestId });
  
  try {
    const response = await handler();
    const duration = Date.now() - start;
    logger.info(`🛬 Request completed: ${req.method} ${url.pathname} - Status ${response.status} in ${duration}ms`, {
      requestId,
      durationMs: duration,
    });
    return response;
  } catch (err: any) {
    const duration = Date.now() - start;
    logger.error(`💥 Request failed: ${req.method} ${url.pathname} in ${duration}ms - Error: ${err.message}`, {
      requestId,
      error: err,
    });
    throw err;
  }
}

// 2. Security Headers Injector
export function getSecurityHeaders(): Headers {
  const nonce = generateNonce();
  const headers = new Headers();
  
  headers.set("Content-Security-Policy", generateCspHeader(nonce));
  headers.set("X-DNS-Prefetch-Control", "on");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  return headers;
}

// 3. Web-Compatible API Rate Limiting Middleware
export async function withRateLimit(req: Request, key: string): Promise<void> {
  const result = await apiRateLimiter.check(key);
  if (!result.allowed) {
    throw new RateLimitError("Too many API requests", {
      limit: result.limit,
      remaining: result.remaining,
      resetSeconds: result.resetSeconds,
      retryAfterSeconds: result.retryAfterSeconds,
    });
  }
}

// 4. Feature Flag Access Gate
export async function withFeatureGate(key: string, context: { userId?: string; orgId?: string; environment?: string }): Promise<void> {
  const isEnabled = await featureFlags.evaluate(key, context);
  if (!isEnabled) {
    throw new AuthorizationError(`Feature flag "${key}" is disabled for your context`);
  }
}

// 5. RBAC Permission Access Gate
export function checkPermission(userRole: string, requiredPermission: string): void {
  const allowed = permissions.hasPermission(userRole, requiredPermission);
  if (!allowed) {
    throw new AuthorizationError(`Insufficient permissions. Required: "${requiredPermission}"`);
  }
}

// 6. Maintenance Mode Block Gate
export async function checkMaintenanceMode(): Promise<void> {
  const isMaintenance = await featureFlags.evaluate("maintenance-mode");
  if (isMaintenance) {
    throw new APIError("System is currently undergoing scheduled maintenance. Please try again later.", 503);
  }
}
