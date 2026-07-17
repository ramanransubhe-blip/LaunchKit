import type { AuthContext, AuthContextStore } from "../core/context.js";
import type { AuthService } from "../core/contracts.js";
import { AuthForbiddenError, AuthUnauthorizedError } from "../core/errors.js";
import type { PermissionService } from "../permissions/index.js";
import type {
  AnyRole,
  AuthOrganization,
  AuthSession,
  AuthUser,
  Permission,
} from "../types/index.js";
import { createPermissionService } from "../permissions/index.js";

/** Server-side auth helper bundle. */
export interface AuthServerHelpers {
  /** Execute a callback in an auth context. */
  runWithAuthContext<T>(context: AuthContext, callback: () => T): T;
  /** Return the current user or `null`. */
  currentUser(): AuthUser | null;
  /** Return the current session or `null`. */
  currentSession(): AuthSession | null;
  /** Return the current organization or `null`. */
  currentOrganization(): AuthOrganization | null;
  /** Require an authenticated context. */
  requireAuth(): AuthContext;
  /** Require a role or one of several roles. */
  requireRole(role: AnyRole | readonly AnyRole[]): AuthContext;
  /** Require a permission or one of several permissions. */
  requirePermission(permission: Permission | readonly Permission[]): AuthContext;
}

/** Options used to create server helpers. */
export interface CreateAuthServerHelpersOptions {
  /** Request-scoped auth context store. */
  store: AuthContextStore;
  /** Permission resolver service. */
  permissions?: PermissionService;
}

/**
 * Creates request-scoped auth server helpers.
 *
 * @param options - Context store and permission resolver.
 * @returns Server helper bundle.
 *
 * @example
 * ```ts
 * const auth = createAuthServerHelpers({ store });
 * const user = auth.requireAuth().user;
 * ```
 */
export function createAuthServerHelpers(
  options: CreateAuthServerHelpersOptions
): AuthServerHelpers {
  const permissions = options.permissions ?? createPermissionService();

  function currentContext(): AuthContext | null {
    return options.store.get();
  }

  function ensureContext(): AuthContext {
    const context = currentContext();
    if (!context || !context.isAuthenticated || !context.user) {
      throw new AuthUnauthorizedError("Authentication is required.");
    }
    return context;
  }

  function ensureRole(role: AnyRole | readonly AnyRole[]): AuthContext {
    const context = ensureContext();
    const roles = Array.isArray(role) ? role : [role];
    const allowed = roles.some((requiredRole) =>
      context.roles.some((currentRole) => permissions.isAtLeast(currentRole, requiredRole))
    );
    if (!allowed) {
      throw new AuthForbiddenError("You do not have access to this resource.");
    }
    return context;
  }

  function ensurePermission(permission: Permission | readonly Permission[]): AuthContext {
    const context = ensureContext();
    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
    const allowed = permissionsToCheck.every((requiredPermission) =>
      context.permissions.includes(requiredPermission)
    );
    if (!allowed) {
      throw new AuthForbiddenError("You do not have access to this resource.");
    }
    return context;
  }

  return {
    runWithAuthContext<T>(context: AuthContext, callback: () => T): T {
      return options.store.run(context, callback);
    },
    currentUser() {
      return currentContext()?.user ?? null;
    },
    currentSession() {
      return currentContext()?.session ?? null;
    },
    currentOrganization() {
      return currentContext()?.organization ?? null;
    },
    requireAuth() {
      return ensureContext();
    },
    requireRole(role) {
      return ensureRole(role);
    },
    requirePermission(permission) {
      return ensurePermission(permission);
    },
  };
}

let activeAuthService: AuthService | null = null;

/** Sets the global active auth service instance on the server. */
export function setGlobalAuthService(service: AuthService): void {
  activeAuthService = service;
}

/** Resolves the global active auth service instance. */
export function getGlobalAuthService(): AuthService {
  if (!activeAuthService) {
    throw new Error(
      "Global AuthService has not been set. Call setGlobalAuthService() during initialization."
    );
  }
  return activeAuthService;
}

export * from "./actions.js";
