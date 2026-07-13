import { AuthProviderType } from "../../types/index.js";
import { createAuthService, type AuthServiceFactoryOptions } from "../../core/factory.js";
import type { AuthService } from "../../core/contracts.js";
import { createClerkBridge, type ClerkBridgeOptions } from "./bridge.js";

export * from "./bridge.js";

/** Bridge interface for a Clerk-backed auth service. */
export type ClerkServiceBridge = Omit<AuthService, "provider">;

/**
 * Creates an auth service bound to Clerk.
 *
 * @param bridgeOrOptions - Clerk bridge or bridge config options.
 * @param options - Shared auth runtime options.
 * @returns Decorated auth service.
 */
export function createClerkService(
  bridgeOrOptions: ClerkServiceBridge | ClerkBridgeOptions,
  options: AuthServiceFactoryOptions = {},
): AuthService {
  const bridge =
    typeof (bridgeOrOptions as any).signIn === "function"
      ? (bridgeOrOptions as ClerkServiceBridge)
      : createClerkBridge(bridgeOrOptions as ClerkBridgeOptions);

  return createAuthService(
    {
      provider: AuthProviderType.Clerk,
      ...bridge,
    },
    options,
  );
}
