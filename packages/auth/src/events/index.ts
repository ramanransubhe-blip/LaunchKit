import { EventEmitter } from "node:events";
import { AuthEventType } from "../types/index.js";
import type {
  AuthInvitation,
  AuthOrganization,
  AuthOrganizationMember,
  AuthSession,
  AuthUser,
  OAuthProvider,
} from "../types/index.js";

/** Typed event payload map for the auth platform. */
export interface AuthEventMap {
  [AuthEventType.UserRegistered]: {
    user: AuthUser;
    session: AuthSession | null;
  };
  [AuthEventType.UserLoggedIn]: {
    user: AuthUser;
    session: AuthSession;
    rememberMe: boolean;
  };
  [AuthEventType.UserLoggedOut]: {
    sessionId: string | null;
    userId: string | null;
  };
  [AuthEventType.ProfileUpdated]: {
    user: AuthUser;
    previous: Readonly<Record<string, unknown>>;
  };
  [AuthEventType.AccountDeleted]: {
    userId: string;
  };
  [AuthEventType.PasswordChanged]: {
    userId: string;
  };
  [AuthEventType.PasswordReset]: {
    userId: string | null;
    email: string | null;
  };
  [AuthEventType.EmailVerified]: {
    userId: string;
  };
  [AuthEventType.InvitationSent]: {
    invitation: AuthInvitation;
  };
  [AuthEventType.InvitationAccepted]: {
    invitation: AuthInvitation;
    organization: AuthOrganization;
  };
  [AuthEventType.InvitationDeclined]: {
    invitation: AuthInvitation;
  };
  [AuthEventType.OrganizationCreated]: {
    organization: AuthOrganization;
  };
  [AuthEventType.OrganizationUpdated]: {
    organization: AuthOrganization;
  };
  [AuthEventType.OrganizationDeleted]: {
    organizationId: string;
  };
  [AuthEventType.OrganizationSwitched]: {
    userId: string;
    organizationId: string;
  };
  [AuthEventType.OrganizationJoined]: {
    member: AuthOrganizationMember;
    organization: AuthOrganization;
  };
  [AuthEventType.OrganizationLeft]: {
    organizationId: string;
    userId: string;
  };
  [AuthEventType.SessionCreated]: {
    session: AuthSession;
  };
  [AuthEventType.SessionRefreshed]: {
    session: AuthSession;
  };
  [AuthEventType.SessionRevoked]: {
    sessionId: string;
    userId: string | null;
  };
  [AuthEventType.SessionInvalidated]: {
    sessionId: string;
    userId: string | null;
  };
  [AuthEventType.AccountLocked]: {
    email: string;
    lockedUntil: Date;
    reason: string;
  };
  [AuthEventType.AccountUnlocked]: {
    email: string;
  };
  [AuthEventType.SuspiciousLogin]: {
    email: string;
    reasons: readonly string[];
    signal: Readonly<Record<string, unknown>>;
  };
  [AuthEventType.ProviderLinked]: {
    userId: string;
    provider: OAuthProvider;
  };
  [AuthEventType.ProviderUnlinked]: {
    userId: string;
    provider: OAuthProvider;
  };
}

/** Typed event listener signature. */
export type AuthEventListener<K extends keyof AuthEventMap> = (
  payload: AuthEventMap[K]
) => void | Promise<void>;

/**
 * Typed auth event bus abstraction.
 *
 * @typeParam TEventMap - Event payload map.
 */
export interface TypedAuthEventBus<TEventMap extends object = AuthEventMap> {
  /** Register a listener. */
  on<K extends keyof TEventMap & string>(
    event: K,
    listener: (payload: TEventMap[K]) => void | Promise<void>
  ): void;
  /** Register a one-shot listener. */
  once<K extends keyof TEventMap & string>(
    event: K,
    listener: (payload: TEventMap[K]) => void | Promise<void>
  ): void;
  /** Remove a listener. */
  off<K extends keyof TEventMap & string>(
    event: K,
    listener: (payload: TEventMap[K]) => void | Promise<void>
  ): void;
  /** Emit an event asynchronously. */
  emit<K extends keyof TEventMap & string>(event: K, payload: TEventMap[K]): Promise<void>;
  /** Count listeners registered for an event. */
  listenerCount<K extends keyof TEventMap & string>(event: K): number;
}

/**
 * Creates an in-memory typed auth event bus.
 *
 * @returns Typed auth event bus instance.
 *
 * @example
 * ```ts
 * const events = createAuthEventBus();
 * await events.emit(AuthEventType.UserLoggedIn, { user, session, rememberMe: true });
 * ```
 */
export function createAuthEventBus(): TypedAuthEventBus<AuthEventMap> {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(100);

  return {
    on(event, listener) {
      emitter.on(event as string, listener as never);
    },
    once(event, listener) {
      emitter.once(event as string, listener as never);
    },
    off(event, listener) {
      emitter.off(event as string, listener as never);
    },
    async emit(event, payload) {
      const listeners = emitter.listeners(event as string);
      const settled = await Promise.allSettled(
        listeners.map((listener) => Promise.resolve(listener(payload as never)))
      );

      for (const result of settled) {
        if (result.status === "rejected") {
          console.error("Auth event listener failed", result.reason);
        }
      }
    },
    listenerCount(event) {
      return emitter.listenerCount(event as string);
    },
  };
}
