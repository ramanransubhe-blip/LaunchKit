import { AsyncLocalStorage } from "node:async_hooks";
import type { AuthContext } from "./contracts.js";

export type { AuthContext } from "./contracts.js";

/** Request-scoped auth context store. */
export interface AuthContextStore {
  /** Execute a callback within the supplied context. */
  run<T>(context: AuthContext, callback: () => T): T;
  /** Resolve the current context, if any. */
  get(): AuthContext | null;
}

/**
 * Creates a request-scoped auth context store.
 *
 * @returns Auth context store.
 *
 * @example
 * ```ts
 * const store = createAuthContextStore();
 * await store.run(context, async () => currentUser());
 * ```
 */
export function createAuthContextStore(): AuthContextStore {
  const storage = new AsyncLocalStorage<AuthContext>();

  return {
    run(context, callback) {
      return storage.run(context, callback);
    },
    get() {
      return storage.getStore() ?? null;
    },
  };
}

/**
 * Builds an empty auth context.
 *
 * @returns Anonymous auth context.
 */
export function createAnonymousAuthContext(): AuthContext {
  return {
    isAuthenticated: false,
    user: null,
    session: null,
    organization: null,
    roles: [],
    permissions: [],
    metadata: null,
  };
}
