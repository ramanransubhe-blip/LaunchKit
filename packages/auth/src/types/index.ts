/**
 * Canonical authentication domain types for DevLaunchKit.
 *
 * These types are provider-agnostic and are shared by the provider
 * adapters, server helpers, client helpers, hooks, validators, and tests.
 */

// =============================================================================
// Provider Identifiers
// =============================================================================

/** Supported provider families for the auth platform. */
export const AuthProviderType = {
  BetterAuth: "better-auth",
  Clerk: "clerk",
} as const;

/** Supported provider families for the auth platform. */
export type AuthProviderType =
  (typeof AuthProviderType)[keyof typeof AuthProviderType];

/** OAuth providers supported by the platform. */
export const OAuthProvider = {
  Google: "google",
  GitHub: "github",
} as const;

/** OAuth providers supported by the platform. */
export type OAuthProvider =
  (typeof OAuthProvider)[keyof typeof OAuthProvider];

// =============================================================================
// Roles and Permissions
// =============================================================================

/** Platform and organization roles supported by the auth layer. */
export const UserRole = {
  Guest: "guest",
  User: "user",
  Admin: "admin",
  SuperAdmin: "super_admin",
} as const;

/** Platform and organization roles supported by the auth layer. */
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Organization-scoped roles supported by the auth layer. */
export const OrganizationRole = {
  Owner: "org_owner",
  Admin: "org_admin",
  Member: "org_member",
} as const;

/** Organization-scoped roles supported by the auth layer. */
export type OrganizationRole =
  (typeof OrganizationRole)[keyof typeof OrganizationRole];

/** Any role supported by the auth layer. */
export type AnyRole = UserRole | OrganizationRole;

/** Canonical permission catalog for DevLaunchKit auth. */
export const Permission = {
  AuthSignIn: "auth.sign_in",
  AuthSignUp: "auth.sign_up",
  AuthSignOut: "auth.sign_out",
  AuthSessionRead: "auth.session_read",
  AuthSessionRefresh: "auth.session_refresh",
  AuthSessionRevoke: "auth.session_revoke",
  AuthSessionRevokeAll: "auth.session_revoke_all",
  AuthProfileRead: "auth.profile_read",
  AuthProfileWrite: "auth.profile_write",
  AuthProfileDelete: "auth.profile_delete",
  AuthEmailVerify: "auth.email_verify",
  AuthMagicLinkSend: "auth.magic_link_send",
  AuthPasswordForgot: "auth.password_forgot",
  AuthPasswordReset: "auth.password_reset",
  AuthPasswordChange: "auth.password_change",
  AuthProviderLink: "auth.provider_link",
  AuthProviderUnlink: "auth.provider_unlink",
  OrganizationRead: "organization.read",
  OrganizationWrite: "organization.write",
  OrganizationCreate: "organization.create",
  OrganizationDelete: "organization.delete",
  OrganizationSwitch: "organization.switch",
  OrganizationInvite: "organization.invite",
  OrganizationMemberRead: "organization.member_read",
  OrganizationMemberWrite: "organization.member_write",
  OrganizationMemberRemove: "organization.member_remove",
  OrganizationMembershipManage: "organization.membership_manage",
  OrganizationRoleManage: "organization.role_manage",
  OrganizationOwnershipTransfer: "organization.ownership_transfer",
  BillingRead: "billing.read",
  BillingWrite: "billing.write",
  AdminAccess: "admin.access",
  AdminAuditRead: "admin.audit_read",
  AdminUserManage: "admin.user_manage",
  AdminOrganizationManage: "admin.organization_manage",
  AdminSecurityManage: "admin.security_manage",
  AdminImpersonate: "admin.impersonate",
} as const;

/** Canonical permission catalog for DevLaunchKit auth. */
export type Permission = (typeof Permission)[keyof typeof Permission];

// =============================================================================
// Subscription and Device Models
// =============================================================================

/** Subscription metadata attached to a user profile. */
export interface SubscriptionInfo {
  /** Stable subscription identifier. */
  readonly id: string;
  /** Human-readable billing plan name. */
  plan: string;
  /** Current subscription lifecycle state. */
  status: SubscriptionStatus;
  /** End of the current billing period, if available. */
  currentPeriodEnd: Date | null;
}

/** Subscription lifecycle states. */
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "incomplete";

/** Captured device metadata for session tracking. */
export interface DeviceInfo {
  /** Device type inferred from the user agent. */
  type: "desktop" | "mobile" | "tablet" | "unknown";
  /** Operating system name, if known. */
  os: string | null;
  /** Browser name, if known. */
  browser: string | null;
}

/** Tracked device profile for suspicious login detection and remember-me flows. */
export interface AuthDevice {
  /** Stable device identifier. */
  readonly id: string;
  /** Fingerprint derived from request metadata. */
  fingerprint: string;
  /** Associated user identifier. */
  readonly userId: string;
  /** Device label, if available. */
  name: string | null;
  /** Normalized device metadata. */
  info: DeviceInfo | null;
  /** Last known IP address. */
  ipAddress: string | null;
  /** Last known user agent. */
  userAgent: string | null;
  /** Whether the device has been trusted by the user. */
  trusted: boolean;
  /** Creation timestamp. */
  readonly createdAt: Date;
  /** Last activity timestamp. */
  lastSeenAt: Date;
}

// =============================================================================
// User, Session, and Organization Models
// =============================================================================

/** Public user profile returned by auth services. */
export interface AuthUser {
  /** Stable user identifier. */
  readonly id: string;
  /** Display name shown in the UI. */
  name: string | null;
  /** Primary email address. */
  email: string;
  /** Avatar or profile image URL. */
  image: string | null;
  /** Current platform or account role. */
  role: UserRole;
  /** Whether the primary email address is verified. */
  emailVerified: boolean;
  /** Verification timestamp, if available. */
  emailVerifiedAt: Date | null;
  /** Current active organization, if one is selected. */
  organizationId: string | null;
  /** All accessible organization identifiers. */
  organizationIds: readonly string[];
  /** Effective permissions for the user. */
  permissions: readonly Permission[];
  /** Optional subscription metadata. */
  subscription: SubscriptionInfo | null;
  /** Current account lockout status. */
  lockedUntil: Date | null;
  /** Last successful login timestamp. */
  lastLoginAt: Date | null;
  /** Account creation timestamp. */
  readonly createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
  /** Arbitrary provider or application metadata. */
  metadata: Readonly<Record<string, unknown>>;
}

/** Session returned by auth services. */
export interface AuthSession {
  /** Stable session identifier. */
  readonly id: string;
  /** User identifier that owns the session. */
  readonly userId: string;
  /** Opaque session token. */
  token: string;
  /** Token expiry. */
  expiresAt: Date;
  /** IP address used for the session. */
  ipAddress: string | null;
  /** User agent used for the session. */
  userAgent: string | null;
  /** Associated device metadata, if available. */
  device: AuthDevice | null;
  /** Current active organization context for the session. */
  organizationId: string | null;
  /** Whether the session is active. */
  isActive: boolean;
  /** Whether the session should persist for remember-me flows. */
  rememberMe: boolean;
  /** Provider family that created the session. */
  provider: AuthProviderType;
  /** Session creation timestamp. */
  readonly createdAt: Date;
  /** Last activity timestamp. */
  lastActiveAt: Date;
  /** Optional revocation timestamp. */
  revokedAt: Date | null;
}

/** Organization returned by auth services. */
export interface AuthOrganization {
  /** Stable organization identifier. */
  readonly id: string;
  /** Display name. */
  name: string;
  /** URL-friendly slug. */
  slug: string;
  /** Optional logo URL. */
  logo: string | null;
  /** Organization owner identifier. */
  ownerId: string;
  /** Creation timestamp. */
  readonly createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
  /** Arbitrary metadata used by the provider or application. */
  metadata: Readonly<Record<string, unknown>>;
}

/** Organization membership returned by auth services. */
export interface AuthOrganizationMember {
  /** Stable membership identifier. */
  readonly id: string;
  /** Organization identifier. */
  readonly organizationId: string;
  /** User identifier. */
  readonly userId: string;
  /** Organization-scoped role. */
  role: OrganizationRole;
  /** Lightweight user projection. */
  user: Pick<AuthUser, "id" | "name" | "email" | "image">;
  /** Join timestamp. */
  readonly joinedAt: Date;
}

/** Invitation returned by auth services. */
export interface AuthInvitation {
  /** Stable invitation identifier. */
  readonly id: string;
  /** Organization identifier. */
  readonly organizationId: string;
  /** Invited email address. */
  email: string;
  /** Assigned organization role. */
  role: OrganizationRole;
  /** Invitation token. */
  token: string;
  /** Current invitation status. */
  status: InvitationStatus;
  /** Inviter identifier. */
  readonly invitedBy: string;
  /** Invitation expiry. */
  expiresAt: Date;
  /** Creation timestamp. */
  readonly createdAt: Date;
}

/** Invitation lifecycle states. */
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

/** Result returned by sign-in and sign-up flows. */
export interface AuthResult {
  /** Authenticated user. */
  user: AuthUser;
  /** Active session. */
  session: AuthSession;
  /** Selected organization, if any. */
  organization: AuthOrganization | null;
}

// =============================================================================
// Provider and Runtime Configuration
// =============================================================================

/** Generic OAuth provider configuration. */
export interface OAuthProviderConfig {
  /** OAuth client identifier. */
  clientId: string;
  /** OAuth client secret. */
  clientSecret: string;
  /** Requested scopes. */
  scopes?: readonly string[];
  /** Optional custom redirect URL. */
  redirectUrl?: string;
}

/** Session configuration used by the auth runtime. */
export interface SessionConfig {
  /** Session duration in seconds. */
  maxAge?: number;
  /** Session refresh cadence in seconds. */
  updateAge?: number;
  /** Cookie name used for the session token. */
  cookieName?: string;
  /** Whether to mark cookies as secure. */
  secureCookie?: boolean;
  /** SameSite cookie policy. */
  sameSite?: "strict" | "lax" | "none";
  /** Whether remember-me sessions are enabled. */
  rememberMe?: boolean;
  /** Remember-me duration in seconds. */
  rememberMeMaxAge?: number;
}

/** Email configuration used by auth flows. */
export interface EmailConfig {
  /** Sender address. */
  from: string;
  /** Optional verification link template. */
  verificationUrl?: string;
  /** Optional password reset link template. */
  resetPasswordUrl?: string;
  /** Optional magic-link template. */
  magicLinkUrl?: string;
}

/** Security configuration used by auth flows. */
export interface SecurityConfig {
  /** Enable CSRF protection. */
  csrf?: boolean;
  /** Enable session rotation. */
  sessionRotation?: boolean;
  /** Maximum failed login attempts before lockout. */
  maxLoginAttempts?: number;
  /** Lockout duration in seconds. */
  lockoutDuration?: number;
  /** Enable suspicious login detection. */
  suspiciousLoginDetection?: boolean;
  /** Minimum password length. */
  minPasswordLength?: number;
  /** Require password complexity. */
  requirePasswordComplexity?: boolean;
}

/** Provider selection and shared runtime configuration. */
export interface AuthProviderConfig {
  /** Provider family to use. */
  provider: AuthProviderType;
  /** Application base URL. */
  baseUrl: string;
  /** Secret used for signing or verifying sensitive auth payloads. */
  secret: string;
  /** Optional OAuth provider configuration. */
  oauth?: Partial<Record<OAuthProvider, OAuthProviderConfig>>;
  /** Optional session configuration. */
  session?: SessionConfig;
  /** Optional email configuration. */
  email?: EmailConfig;
  /** Optional security configuration. */
  security?: SecurityConfig;
}

/** Metadata attached to auth operations for auditing and security. */
export interface AuthActionMetadata {
  /** Request trace identifier. */
  requestId?: string;
  /** Request IP address. */
  ipAddress?: string;
  /** Request user agent. */
  userAgent?: string;
  /** Device identifier. */
  deviceId?: string;
  /** Fingerprint derived from the request. */
  deviceFingerprint?: string;
  /** Selected organization context. */
  organizationId?: string;
  /** Whether the request should create a remembered session. */
  rememberMe?: boolean;
}

/** Credentials used by sign-in flows. */
export interface SignInCredentials {
  /** Primary email address. */
  email: string;
  /** Account password. */
  password: string;
  /** Whether the session should persist beyond the default age. */
  rememberMe?: boolean;
  /** Request metadata for audit and security. */
  meta?: AuthActionMetadata;
}

/** Data used by sign-up flows. */
export interface SignUpData {
  /** Primary email address. */
  email: string;
  /** Account password. */
  password: string;
  /** Display name. */
  name: string;
  /** Request metadata for audit and security. */
  meta?: AuthActionMetadata;
}

/** Data used to update a user profile. */
export interface UpdateUserData {
  /** New display name. */
  name?: string;
  /** New email address. */
  email?: string;
  /** New avatar or image URL. */
  image?: string | null;
  /** New role. */
  role?: UserRole;
  /** New active organization identifier. */
  organizationId?: string | null;
  /** Arbitrary profile metadata. */
  metadata?: Readonly<Record<string, unknown>>;
}

/** Data used to create an organization. */
export interface CreateOrganizationData {
  /** Organization name. */
  name: string;
  /** Optional organization slug. */
  slug?: string;
  /** Optional organization logo URL. */
  logo?: string | null;
  /** Optional metadata. */
  metadata?: Readonly<Record<string, unknown>>;
}

/** Data used to update an organization. */
export interface UpdateOrganizationData {
  /** New name. */
  name?: string;
  /** New slug. */
  slug?: string;
  /** New logo URL. */
  logo?: string | null;
  /** New metadata. */
  metadata?: Readonly<Record<string, unknown>>;
}

// =============================================================================
// Auth Events
// =============================================================================

/** Typed auth event names. */
export const AuthEventType = {
  UserRegistered: "user.registered",
  UserLoggedIn: "user.logged_in",
  UserLoggedOut: "user.logged_out",
  ProfileUpdated: "profile.updated",
  AccountDeleted: "account.deleted",
  PasswordChanged: "password.changed",
  PasswordReset: "password.reset",
  EmailVerified: "email.verified",
  InvitationSent: "invitation.sent",
  InvitationAccepted: "invitation.accepted",
  InvitationDeclined: "invitation.declined",
  OrganizationCreated: "organization.created",
  OrganizationUpdated: "organization.updated",
  OrganizationDeleted: "organization.deleted",
  OrganizationSwitched: "organization.switched",
  OrganizationJoined: "organization.joined",
  OrganizationLeft: "organization.left",
  SessionCreated: "session.created",
  SessionRefreshed: "session.refreshed",
  SessionRevoked: "session.revoked",
  SessionInvalidated: "session.invalidated",
  AccountLocked: "account.locked",
  AccountUnlocked: "account.unlocked",
  SuspiciousLogin: "suspicious.login",
  ProviderLinked: "provider.linked",
  ProviderUnlinked: "provider.unlinked",
} as const;

/** Typed auth event names. */
export type AuthEventType =
  (typeof AuthEventType)[keyof typeof AuthEventType];

/** Metadata attached to auth events. */
export interface AuthEventMetadata {
  /** Request IP address. */
  ipAddress?: string;
  /** Request user agent. */
  userAgent?: string;
  /** Request trace identifier. */
  requestId?: string;
  /** Provider responsible for the event. */
  provider?: AuthProviderType;
}

/** Typed auth event payload. */
export interface AuthEvent<T = Readonly<Record<string, unknown>>> {
  /** Event name. */
  type: AuthEventType;
  /** User identifier associated with the event. */
  userId: string;
  /** Event payload. */
  payload: T;
  /** Event metadata. */
  metadata: AuthEventMetadata;
  /** Event timestamp. */
  timestamp: Date;
}

// =============================================================================
// Auth Errors
// =============================================================================

/** Typed auth error catalog. */
export const AuthErrorCode = {
  InvalidCredentials: "AUTH_INVALID_CREDENTIALS",
  ExpiredSession: "AUTH_EXPIRED_SESSION",
  Unauthorized: "AUTH_UNAUTHORIZED",
  Forbidden: "AUTH_FORBIDDEN",
  EmailNotVerified: "AUTH_EMAIL_NOT_VERIFIED",
  AccountLocked: "AUTH_ACCOUNT_LOCKED",
  ProviderError: "AUTH_PROVIDER_ERROR",
  InvalidToken: "AUTH_INVALID_TOKEN",
  ExpiredToken: "AUTH_EXPIRED_TOKEN",
  UserNotFound: "AUTH_USER_NOT_FOUND",
  UserExists: "AUTH_USER_EXISTS",
  WeakPassword: "AUTH_WEAK_PASSWORD",
  RateLimited: "AUTH_RATE_LIMITED",
  InvalidOAuthState: "AUTH_INVALID_OAUTH_STATE",
  OAuthFailed: "AUTH_OAUTH_FAILED",
  OrganizationNotFound: "AUTH_ORGANIZATION_NOT_FOUND",
  OrganizationConflict: "AUTH_ORGANIZATION_CONFLICT",
  InvitationExpired: "AUTH_INVITATION_EXPIRED",
  InvitationInvalid: "AUTH_INVITATION_INVALID",
  MembershipExists: "AUTH_MEMBERSHIP_EXISTS",
  PermissionDenied: "AUTH_PERMISSION_DENIED",
  ValidationFailed: "AUTH_VALIDATION_FAILED",
  InternalError: "AUTH_INTERNAL_ERROR",
} as const;

/** Typed auth error catalog. */
export type AuthErrorCode =
  (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

// =============================================================================
// Email Types
// =============================================================================

/** Supported auth email templates. */
export type AuthEmailTemplate =
  | "verification"
  | "magic-link"
  | "password-reset"
  | "welcome"
  | "organization-invitation";

/** Payload used by auth email transports. */
export interface AuthEmailPayload {
  /** Recipient address. */
  to: string;
  /** Email subject. */
  subject: string;
  /** Template identifier. */
  template: AuthEmailTemplate;
  /** Template data. */
  data: Readonly<Record<string, unknown>>;
}
