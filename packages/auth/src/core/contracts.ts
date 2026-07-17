import type {
  AnyRole,
  AuthActionMetadata,
  AuthDevice,
  AuthEmailPayload,
  AuthInvitation,
  AuthOrganization,
  AuthOrganizationMember,
  AuthProviderConfig,
  AuthProviderType,
  AuthResult,
  AuthSession,
  AuthUser,
  CreateOrganizationData,
  OAuthProvider,
  OrganizationRole,
  Permission,
  SignInCredentials,
  SignUpData,
  UpdateOrganizationData,
  UpdateUserData,
} from "../types/index.js";
import type { AuthEventMap, TypedAuthEventBus } from "../events/index.js";

/** Login attempt record stored by the auth repository. */
export interface AuthLoginAttempt {
  /** Email address used for the attempt. */
  email: string;
  /** User identifier if the account exists. */
  userId: string | null;
  /** Whether the attempt succeeded. */
  success: boolean;
  /** Failure reason when the attempt did not succeed. */
  failureReason: string | null;
  /** Optional request metadata. */
  metadata: AuthActionMetadata | null;
  /** Creation timestamp. */
  readonly createdAt: Date;
}

/** Account lock state used for brute-force protection. */
export interface AuthAccountLock {
  /** Email address or identifier that is locked. */
  email: string;
  /** Lock expiry. */
  lockedUntil: Date;
  /** Human-readable reason for the lock. */
  reason: string;
  /** Creation timestamp. */
  readonly createdAt: Date;
}

/** Audit event stored by the auth repository. */
export interface AuthAuditRecord {
  /** Stable record identifier. */
  readonly id: string;
  /** Event name. */
  type: string;
  /** Subject user identifier. */
  userId: string;
  /** Event payload. */
  payload: Readonly<Record<string, unknown>>;
  /** Event metadata. */
  metadata: Readonly<Record<string, unknown>>;
  /** Creation timestamp. */
  readonly createdAt: Date;
}

/**
 * Unified auth context resolved for server-side helpers and middleware.
 *
 * @example
 * ```ts
 * const context = await currentSession();
 * if (context?.isAuthenticated) {
 *   console.log(context.user.email);
 * }
 * ```
 */
export interface AuthContext {
  /** Whether a user is currently authenticated. */
  readonly isAuthenticated: boolean;
  /** Resolved user, when present. */
  user: AuthUser | null;
  /** Resolved session, when present. */
  session: AuthSession | null;
  /** Current organization, when present. */
  organization: AuthOrganization | null;
  /** Active roles associated with the context. */
  roles: readonly AnyRole[];
  /** Effective permissions for the context. */
  permissions: readonly Permission[];
  /** Request metadata used to resolve the context. */
  metadata: AuthActionMetadata | null;
}

/**
 * Repository boundary for auth-local data.
 *
 * @example
 * ```ts
 * const repository = createMemoryAuthRepository();
 * await repository.recordLoginAttempt({...});
 * ```
 */
export interface AuthRepository {
  /** Record a login attempt for security analytics and lockout checks. */
  recordLoginAttempt(attempt: AuthLoginAttempt): Promise<void>;
  /** Count failed attempts since a given timestamp. */
  countFailedLoginAttempts(email: string, since: Date): Promise<number>;
  /** Read the current lock status for an email address. */
  getAccountLock(email: string): Promise<AuthAccountLock | null>;
  /** Persist a lock state for an email address. */
  setAccountLock(lock: AuthAccountLock): Promise<void>;
  /** Remove a lock state for an email address. */
  clearAccountLock(email: string): Promise<void>;
  /** Upsert a tracked device. */
  upsertDevice(device: AuthDevice): Promise<AuthDevice>;
  /** List tracked devices for a user. */
  listDevices(userId: string): Promise<readonly AuthDevice[]>;
  /** Record an audit event. */
  recordAuditEvent(record: AuthAuditRecord): Promise<void>;
  /** List audit records for a user. */
  listAuditEvents(userId: string): Promise<readonly AuthAuditRecord[]>;
}

/**
 * Typed interface implemented by every auth provider adapter.
 *
 * @example
 * ```ts
 * const auth = createBetterAuthService({...});
 * const result = await auth.signIn({ email, password });
 * ```
 */
export interface AuthService {
  /** Provider family backing the service. */
  readonly provider: AuthProviderType;

  // Authentication
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signUp(data: SignUpData): Promise<AuthResult>;
  signOut(sessionId?: string): Promise<void>;

  // Sessions
  getSession(token: string): Promise<AuthSession | null>;
  refreshSession(token: string): Promise<AuthSession>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllSessions(userId: string): Promise<void>;
  getActiveSessions(userId: string): Promise<readonly AuthSession[]>;

  // Users
  getUser(userId: string): Promise<AuthUser | null>;
  getUserByEmail(email: string): Promise<AuthUser | null>;
  updateProfile(userId: string, data: UpdateUserData): Promise<AuthUser>;
  updateUser(userId: string, data: UpdateUserData): Promise<AuthUser>;
  deleteAccount(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;

  // Email verification
  sendVerificationEmail(userId: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;

  // Password
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;

  // Magic link
  sendMagicLink(email: string): Promise<void>;
  verifyMagicLink(token: string): Promise<AuthResult>;

  // OAuth
  getOAuthUrl(provider: OAuthProvider, redirectUrl: string, state?: string): Promise<string>;
  handleOAuthCallback(provider: OAuthProvider, code: string, state?: string): Promise<AuthResult>;
  linkProvider(
    userId: string,
    provider: OAuthProvider,
    code: string,
    state?: string
  ): Promise<AuthUser>;
  unlinkProvider(userId: string, provider: OAuthProvider): Promise<AuthUser>;

  // Organizations
  createOrganization(userId: string, data: CreateOrganizationData): Promise<AuthOrganization>;
  getOrganization(orgId: string): Promise<AuthOrganization | null>;
  updateOrganization(orgId: string, data: UpdateOrganizationData): Promise<AuthOrganization>;
  deleteOrganization(orgId: string): Promise<void>;
  getOrganizationMembers(orgId: string): Promise<readonly AuthOrganizationMember[]>;
  inviteToOrganization(
    orgId: string,
    email: string,
    role: OrganizationRole
  ): Promise<AuthInvitation>;
  acceptInvitation(token: string): Promise<void>;
  removeFromOrganization(orgId: string, userId: string): Promise<void>;
  switchOrganization(userId: string, orgId: string): Promise<void>;
}

/**
 * Transport used by the client package to call an auth backend.
 *
 * @typeParam TRequest - Request payload type.
 * @typeParam TResponse - Response payload type.
 */
export interface AuthTransport<TRequest = unknown, TResponse = unknown> {
  /** Executes an operation against the backend. */
  request(operation: string, input: TRequest): Promise<TResponse>;
}

/**
 * Convenience interface for auth email transports.
 *
 * @example
 * ```ts
 * await emailTransport.send({
 *   to: "user@example.com",
 *   subject: "Verify your email",
 *   template: "verification",
 *   data: { verificationUrl },
 * });
 * ```
 */
export interface AuthEmailTransport {
  /** Sends a templated auth email. */
  send(payload: AuthEmailPayload): Promise<void>;
}

/**
 * Dependencies used by the auth service decorator.
 *
 * @example
 * ```ts
 * const service = createAuthService(baseService, {
 *   repository,
 *   events,
 *   security,
 * });
 * ```
 */
export interface AuthServiceDependencies {
  /** Optional repository for local auth security state. */
  repository?: AuthRepository;
  /** Optional event bus for auth lifecycle events. */
  events?: AuthEventBus;
  /** Optional email transport for notifications. */
  email?: AuthEmailTransport;
  /** Optional runtime configuration. */
  config?: AuthProviderConfig;
  /** Optional server clock override for tests. */
  now?: () => Date;
}

/** Typed auth event bus used by the service wrapper. */
export type AuthEventBus = TypedAuthEventBus<AuthEventMap>;
