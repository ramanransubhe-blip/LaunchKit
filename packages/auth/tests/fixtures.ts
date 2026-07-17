import {
  AuthProviderType,
  OrganizationRole,
  Permission,
  UserRole,
  type AuthInvitation,
  type AuthOrganization,
  type AuthResult,
  type AuthSession,
  type AuthUser,
} from "../src/index.js";

/** Shared auth fixtures used by the tests. */
export interface AuthTestFixtures {
  /** Baseline user. */
  user: AuthUser;
  /** Baseline session. */
  session: AuthSession;
  /** Baseline organization. */
  organization: AuthOrganization;
  /** Baseline invitation. */
  invitation: AuthInvitation;
  /** Baseline sign-in result. */
  result: AuthResult;
}

/**
 * Creates reusable auth fixtures for tests.
 *
 * @returns Stable test fixtures.
 */
export function createAuthFixtures(): AuthTestFixtures {
  const now = new Date("2026-07-12T00:00:00.000Z");

  const user: AuthUser = {
    id: "user_1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    image: null,
    role: UserRole.User,
    emailVerified: true,
    emailVerifiedAt: now,
    organizationId: "org_1",
    organizationIds: ["org_1"],
    permissions: [
      Permission.AuthSignOut,
      Permission.AuthSessionRead,
      Permission.AuthSessionRefresh,
      Permission.AuthProfileRead,
      Permission.AuthProfileWrite,
      Permission.OrganizationRead,
    ],
    subscription: null,
    lockedUntil: null,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
    metadata: {},
  };

  const session: AuthSession = {
    id: "session_1",
    userId: user.id,
    token: "session-token-1",
    expiresAt: new Date("2026-07-19T00:00:00.000Z"),
    ipAddress: "127.0.0.1",
    userAgent: "TestAgent/1.0",
    device: null,
    organizationId: "org_1",
    isActive: true,
    rememberMe: false,
    provider: AuthProviderType.BetterAuth,
    createdAt: now,
    lastActiveAt: now,
    revokedAt: null,
  };

  const organization: AuthOrganization = {
    id: "org_1",
    name: "Example Org",
    slug: "example-org",
    logo: null,
    ownerId: user.id,
    createdAt: now,
    updatedAt: now,
    metadata: {},
  };

  const invitation: AuthInvitation = {
    id: "inv_1",
    organizationId: organization.id,
    email: "guest@example.com",
    role: OrganizationRole.Member,
    token: "invitation-token-1",
    status: "pending",
    invitedBy: user.id,
    expiresAt: new Date("2026-07-19T00:00:00.000Z"),
    createdAt: now,
  };

  return {
    user,
    session,
    organization,
    invitation,
    result: {
      user,
      session,
      organization,
    },
  };
}
