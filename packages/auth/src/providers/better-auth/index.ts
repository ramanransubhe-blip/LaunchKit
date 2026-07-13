import { AuthProviderType } from "../../types/index.js";
import { createAuthService, type AuthServiceFactoryOptions } from "../../core/factory.js";
import type { AuthService } from "../../core/contracts.js";
import { createBetterAuthBridge, type BetterAuthBridgeOptions } from "./bridge.js";

export * from "./bridge.js";

/** Bridge interface for a Better Auth-backed auth service. */
export type BetterAuthServiceBridge = Omit<AuthService, "provider">;

/**
 * Creates an auth service bound to Better Auth.
 *
 * @param bridgeOrOptions - Better Auth bridge or bridge config options.
 * @param options - Shared auth runtime options.
 * @returns Decorated auth service.
 */
export function createBetterAuthService(
  bridgeOrOptions: BetterAuthServiceBridge | BetterAuthBridgeOptions,
  options: AuthServiceFactoryOptions = {},
): AuthService {
  const bridge =
    typeof (bridgeOrOptions as any).signIn === "function"
      ? (bridgeOrOptions as BetterAuthServiceBridge)
      : createBetterAuthBridge(bridgeOrOptions as BetterAuthBridgeOptions);

  return createAuthService(
    {
      provider: AuthProviderType.BetterAuth,
      ...bridge,
    },
    options,
  );
}
