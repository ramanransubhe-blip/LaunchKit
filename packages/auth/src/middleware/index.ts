import { createPermissionService } from "../permissions/index.js";
import type { PermissionService } from "../permissions/index.js";
import { AuthUnauthorizedError } from "../core/errors.js";
import type { AuthContext } from "../core/context.js";
import { Permission, type AnyRole } from "../types/index.js";

/** Route matcher definition. */
export interface RouteMatcher {
  /** Exact path matches. */
  exact?: readonly string[];
  /** Prefix path matches. */
  prefix?: readonly string[];
  /** Regular expression matches. */
  regex?: readonly RegExp[];
}

/** Auth route policy configuration. */
export interface AuthRoutePolicy {
  /** Routes that bypass auth checks. */
  public?: RouteMatcher;
  /** Routes that require an authenticated user. */
  protected?: RouteMatcher;
  /** Routes that require an organization context. */
  organization?: RouteMatcher;
  /** Routes that require admin access. */
  admin?: RouteMatcher;
  /** Path to redirect unauthenticated users to. */
  signInPath: string;
  /** Path to redirect when organization context is missing. */
  selectOrganizationPath: string;
  /** Path to redirect when admin access is missing. */
  forbiddenPath: string;
}

/** Auth middleware input. */
export interface AuthMiddlewareInput {
  /** Request URL. */
  url: string;
  /** Request pathname. */
  pathname: string;
  /** Request auth context. */
  context: AuthContext | null;
}

/** Middleware decision outcome. */
export type AuthMiddlewareResult =
  | {
      action: "allow";
    }
  | {
      action: "redirect";
      location: string;
    }
  | {
      action: "forbidden";
      reason: string;
    };

/** Auth middleware function signature. */
export type AuthMiddleware = (
  input: AuthMiddlewareInput,
) => AuthMiddlewareResult;

/** Options for creating auth middleware. */
export interface CreateAuthMiddlewareOptions {
  /** Route policy. */
  policy: AuthRoutePolicy;
  /** Permission service, defaults to the package resolver. */
  permissions?: PermissionService;
}

/**
 * Creates a route matcher from path-like inputs.
 *
 * @param matcher - Route matcher config.
 * @returns Normalized matcher.
 */
export function normalizeRouteMatcher(
  matcher: RouteMatcher | undefined,
): Required<RouteMatcher> {
  return {
    exact: matcher?.exact ?? [],
    prefix: matcher?.prefix ?? [],
    regex: matcher?.regex ?? [],
  };
}

/**
 * Checks whether a pathname matches a route matcher.
 *
 * @param pathname - Pathname to inspect.
 * @param matcher - Route matcher.
 * @returns `true` when the route matches.
 */
export function matchesRoute(
  pathname: string,
  matcher: RouteMatcher | undefined,
): boolean {
  const normalized = normalizeRouteMatcher(matcher);
  const exactMatch = normalized.exact.some((entry) => entry === pathname);
  if (exactMatch) {
    return true;
  }

  const prefixMatch = normalized.prefix.some((entry) => {
    const normalizedEntry = entry.endsWith("*")
      ? entry.slice(0, -1)
      : entry;
    return pathname.startsWith(normalizedEntry);
  });
  if (prefixMatch) {
    return true;
  }

  return normalized.regex.some((regex) => regex.test(pathname));
}

/**
 * Creates a route-aware auth middleware.
 *
 * @param options - Route policy and permission service.
 * @returns Middleware decision function.
 *
 * @example
 * ```ts
 * const middleware = createAuthMiddleware({
 *   policy: {
 *     signInPath: "/login",
 *     selectOrganizationPath: "/select-org",
 *     forbiddenPath: "/403",
 *     protected: { prefix: ["/app"] },
 *     organization: { prefix: ["/org"] },
 *     admin: { prefix: ["/admin"] },
 *   },
 * });
 * ```
 */
export function createAuthMiddleware(
  options: CreateAuthMiddlewareOptions,
): AuthMiddleware {
  const permissions = options.permissions ?? createPermissionService();

  return (input) => {
    const { pathname, context } = input;

    if (matchesRoute(pathname, options.policy.public)) {
      return { action: "allow" };
    }

    if (!context || !context.isAuthenticated || !context.user) {
      return {
        action: "redirect",
        location: `${options.policy.signInPath}?next=${encodeURIComponent(input.url)}`,
      };
    }

    if (matchesRoute(pathname, options.policy.admin)) {
      const allowed = context.roles.some((role: AnyRole) =>
        permissions.hasPermission(role, Permission.AdminAccess),
      );
      if (!allowed) {
        return {
          action: "redirect",
          location: options.policy.forbiddenPath,
        };
      }
    }

    if (matchesRoute(pathname, options.policy.organization)) {
      if (!context.organization) {
        return {
          action: "redirect",
          location: `${options.policy.selectOrganizationPath}?next=${encodeURIComponent(input.url)}`,
        };
      }
    }

    if (matchesRoute(pathname, options.policy.protected)) {
      return { action: "allow" };
    }

    return { action: "allow" };
  };
}

/**
 * Throws when auth is required but missing.
 *
 * @param context - Auth context.
 * @returns The provided context.
 */
export function requireAuthContext(context: AuthContext | null): AuthContext {
  if (!context || !context.isAuthenticated || !context.user) {
    throw new AuthUnauthorizedError("Authentication is required.");
  }
  return context;
}
