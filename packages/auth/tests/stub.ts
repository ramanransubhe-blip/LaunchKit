import {
  AuthProviderType,
  OrganizationRole,
  type AuthInvitation,
  type AuthOrganization,
  type AuthOrganizationMember,
  type AuthResult,
  type AuthSession,
  type AuthService,
  type AuthUser,
  type CreateOrganizationData,
  type OAuthProvider,
  type SignInCredentials,
  type SignUpData,
  type UpdateOrganizationData,
  type UpdateUserData,
} from "../src/index.js";
import { createAuthFixtures } from "./fixtures.js";

/** Call entry captured by the stub auth service. */
export interface StubCall {
  /** Method name. */
  method: string;
  /** Captured input. */
  input: unknown;
}

/** Stub auth service with captured call history. */
export interface StubAuthService {
  /** Auth service implementation. */
  service: AuthService;
  /** Recorded method calls. */
  calls: readonly StubCall[];
}

/**
 * Creates a deterministic auth service stub for tests.
 *
 * @returns Stub service and call log.
 */
export function createAuthServiceStub(): StubAuthService {
  const fixtures = createAuthFixtures();
  const calls: StubCall[] = [];

  function push(method: string, input: unknown): void {
    calls.push({ method, input });
  }

  const service: AuthService = {
    provider: AuthProviderType.BetterAuth,
    async signIn(credentials: SignInCredentials): Promise<AuthResult> {
      push("signIn", credentials);
      return fixtures.result;
    },
    async signUp(data: SignUpData): Promise<AuthResult> {
      push("signUp", data);
      return fixtures.result;
    },
    async signOut(sessionId?: string): Promise<void> {
      push("signOut", { sessionId });
    },
    async getSession(token: string): Promise<AuthSession | null> {
      push("getSession", { token });
      return token === fixtures.session.token ? fixtures.session : null;
    },
    async refreshSession(token: string): Promise<AuthSession> {
      push("refreshSession", { token });
      return fixtures.session;
    },
    async invalidateSession(sessionId: string): Promise<void> {
      push("invalidateSession", { sessionId });
    },
    async invalidateAllSessions(userId: string): Promise<void> {
      push("invalidateAllSessions", { userId });
    },
    async getActiveSessions(userId: string): Promise<readonly AuthSession[]> {
      push("getActiveSessions", { userId });
      return userId === fixtures.user.id ? [fixtures.session] : [];
    },
    async getUser(userId: string): Promise<AuthUser | null> {
      push("getUser", { userId });
      return userId === fixtures.user.id ? fixtures.user : null;
    },
    async getUserByEmail(email: string): Promise<AuthUser | null> {
      push("getUserByEmail", { email });
      return email === fixtures.user.email ? fixtures.user : null;
    },
    async updateProfile(userId: string, data: UpdateUserData): Promise<AuthUser> {
      push("updateProfile", { userId, data });
      return {
        ...fixtures.user,
        ...data,
      };
    },
    async updateUser(userId: string, data: UpdateUserData): Promise<AuthUser> {
      push("updateUser", { userId, data });
      return {
        ...fixtures.user,
        ...data,
      };
    },
    async deleteAccount(userId: string): Promise<void> {
      push("deleteAccount", { userId });
    },
    async deleteUser(userId: string): Promise<void> {
      push("deleteUser", { userId });
    },
    async sendVerificationEmail(userId: string): Promise<void> {
      push("sendVerificationEmail", { userId });
    },
    async verifyEmail(token: string): Promise<void> {
      push("verifyEmail", { token });
    },
    async forgotPassword(email: string): Promise<void> {
      push("forgotPassword", { email });
    },
    async resetPassword(token: string, newPassword: string): Promise<void> {
      push("resetPassword", { token, newPassword });
    },
    async changePassword(
      userId: string,
      currentPassword: string,
      newPassword: string
    ): Promise<void> {
      push("changePassword", { userId, currentPassword, newPassword });
    },
    async sendMagicLink(email: string): Promise<void> {
      push("sendMagicLink", { email });
    },
    async verifyMagicLink(token: string): Promise<AuthResult> {
      push("verifyMagicLink", { token });
      return fixtures.result;
    },
    async getOAuthUrl(
      provider: OAuthProvider,
      redirectUrl: string,
      state?: string
    ): Promise<string> {
      push("getOAuthUrl", { provider, redirectUrl, state });
      return `https://auth.example.com/${provider}?redirect=${encodeURIComponent(redirectUrl)}`;
    },
    async handleOAuthCallback(
      provider: OAuthProvider,
      code: string,
      state?: string
    ): Promise<AuthResult> {
      push("handleOAuthCallback", { provider, code, state });
      return fixtures.result;
    },
    async linkProvider(
      userId: string,
      provider: OAuthProvider,
      code: string,
      state?: string
    ): Promise<AuthUser> {
      push("linkProvider", { userId, provider, code, state });
      return fixtures.user;
    },
    async unlinkProvider(userId: string, provider: OAuthProvider): Promise<AuthUser> {
      push("unlinkProvider", { userId, provider });
      return fixtures.user;
    },
    async createOrganization(
      userId: string,
      data: CreateOrganizationData
    ): Promise<AuthOrganization> {
      push("createOrganization", { userId, data });
      return fixtures.organization;
    },
    async getOrganization(orgId: string): Promise<AuthOrganization | null> {
      push("getOrganization", { orgId });
      return orgId === fixtures.organization.id ? fixtures.organization : null;
    },
    async updateOrganization(
      orgId: string,
      data: UpdateOrganizationData
    ): Promise<AuthOrganization> {
      push("updateOrganization", { orgId, data });
      return {
        ...fixtures.organization,
        ...data,
      };
    },
    async deleteOrganization(orgId: string): Promise<void> {
      push("deleteOrganization", { orgId });
    },
    async getOrganizationMembers(orgId: string): Promise<readonly AuthOrganizationMember[]> {
      push("getOrganizationMembers", { orgId });
      return [];
    },
    async inviteToOrganization(
      orgId: string,
      email: string,
      role: OrganizationRole
    ): Promise<AuthInvitation> {
      push("inviteToOrganization", { orgId, email, role });
      return fixtures.invitation;
    },
    async acceptInvitation(token: string): Promise<void> {
      push("acceptInvitation", { token });
    },
    async removeFromOrganization(orgId: string, userId: string): Promise<void> {
      push("removeFromOrganization", { orgId, userId });
    },
    async switchOrganization(userId: string, orgId: string): Promise<void> {
      push("switchOrganization", { userId, orgId });
    },
  };

  return {
    service,
    calls,
  };
}
