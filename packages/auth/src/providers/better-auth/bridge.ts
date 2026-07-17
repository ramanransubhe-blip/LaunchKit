import type { BetterAuthServiceBridge } from "./index.js";
import type {
  AuthInvitation,
  AuthOrganization,
  AuthOrganizationMember,
  AuthResult,
  AuthSession,
  AuthUser,
} from "../../types/index.js";
import { AuthProviderType, UserRole } from "../../types/index.js";
import { AuthProviderError } from "../../core/errors.js";

/** Configuration options for the Better Auth bridge. */
export interface BetterAuthBridgeOptions {
  baseUrl: string;
  secret: string;
  isMock?: boolean;
}

/**
 * Creates a Better Auth Service Bridge.
 */
export function createBetterAuthBridge(options: BetterAuthBridgeOptions): BetterAuthServiceBridge {
  const { baseUrl, secret, isMock = false } = options;

  async function request<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    if (isMock) {
      throw new AuthProviderError("Better Auth API not configured in mock mode.");
    }

    try {
      const url = new URL(path, baseUrl).toString();
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AuthProviderError(
          `Better Auth API request failed (${response.status}): ${errorText}`,
          { status: response.status }
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AuthProviderError) {
        throw error;
      }
      throw new AuthProviderError(
        `Failed to execute Better Auth request: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Simulated fallback helper when mock mode is enabled or for fallback tests
  function createMockResult(email: string, name = "Test User"): AuthResult {
    const user: AuthUser = {
      id: "usr_mock_better_auth",
      email,
      name,
      image: null,
      role: UserRole.User,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      organizationId: null,
      organizationIds: [],
      permissions: [],
      subscription: null,
      metadata: {},
      lockedUntil: null,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session: AuthSession = {
      id: "sess_mock_better_auth",
      token: "tok_mock_better_auth",
      userId: user.id,
      userAgent: "mock-agent",
      ipAddress: "127.0.0.1",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      device: null,
      organizationId: null,
      isActive: true,
      rememberMe: false,
      provider: AuthProviderType.BetterAuth,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      revokedAt: null,
    };

    return {
      user,
      session,
      organization: null,
    };
  }

  return {
    async signIn(credentials) {
      if (isMock) {
        return createMockResult(credentials.email);
      }
      return request<AuthResult>("/api/auth/sign-in/email", "POST", credentials);
    },

    async signUp(data) {
      if (isMock) {
        return createMockResult(data.email, data.name);
      }
      return request<AuthResult>("/api/auth/sign-up/email", "POST", data);
    },

    async signOut(sessionId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/sign-out", "POST", { sessionId });
    },

    async getSession(token) {
      if (isMock) {
        if (token === "tok_mock_better_auth") {
          return createMockResult("test@example.com").session;
        }
        return null;
      }
      return request<AuthSession | null>(
        `/api/auth/get-session?token=${encodeURIComponent(token)}`,
        "GET"
      );
    },

    async refreshSession(token) {
      if (isMock) {
        const session = createMockResult("test@example.com").session;
        return {
          ...session,
          token: `refreshed_${token}`,
          updatedAt: new Date(),
        };
      }
      return request<AuthSession>("/api/auth/refresh-session", "POST", { token });
    },

    async invalidateSession(sessionId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/invalidate-session", "POST", { sessionId });
    },

    async invalidateAllSessions(userId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/invalidate-all-sessions", "POST", { userId });
    },

    async getActiveSessions(userId) {
      if (isMock) {
        return [createMockResult("test@example.com").session];
      }
      return request<readonly AuthSession[]>(
        `/api/auth/sessions?userId=${encodeURIComponent(userId)}`,
        "GET"
      );
    },

    async getUser(userId) {
      if (isMock) {
        if (userId === "usr_mock_better_auth") {
          return createMockResult("test@example.com").user;
        }
        return null;
      }
      return request<AuthUser | null>(`/api/auth/user?userId=${encodeURIComponent(userId)}`, "GET");
    },

    async getUserByEmail(email) {
      if (isMock) {
        return createMockResult(email).user;
      }
      return request<AuthUser | null>(
        `/api/auth/user-by-email?email=${encodeURIComponent(email)}`,
        "GET"
      );
    },

    async updateProfile(userId, data) {
      if (isMock) {
        const user = createMockResult("test@example.com").user;
        return { ...user, ...data, updatedAt: new Date() };
      }
      return request<AuthUser>("/api/auth/profile/update", "POST", { userId, ...data });
    },

    async updateUser(userId, data) {
      if (isMock) {
        const user = createMockResult("test@example.com").user;
        return { ...user, ...data, updatedAt: new Date() };
      }
      return request<AuthUser>("/api/auth/user/update", "POST", { userId, ...data });
    },

    async deleteAccount(userId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/account/delete", "POST", { userId });
    },

    async deleteUser(userId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/user/delete", "POST", { userId });
    },

    async sendVerificationEmail(userId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/verify-email/send", "POST", { userId });
    },

    async verifyEmail(token) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/verify-email", "POST", { token });
    },

    async forgotPassword(email) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/forgot-password", "POST", { email });
    },

    async resetPassword(token, newPassword) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/reset-password", "POST", { token, newPassword });
    },

    async changePassword(userId, currentPassword, newPassword) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/change-password", "POST", {
        userId,
        currentPassword,
        newPassword,
      });
    },

    async sendMagicLink(email) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/magic-link/send", "POST", { email });
    },

    async verifyMagicLink(token) {
      if (isMock) {
        return createMockResult("magic@example.com");
      }
      return request<AuthResult>("/api/auth/magic-link/verify", "POST", { token });
    },

    async getOAuthUrl(provider, redirectUrl, state) {
      if (isMock) {
        return `https://mock-better-auth.com/oauth/${provider}?redirect=${encodeURIComponent(redirectUrl)}`;
      }
      return request<string>("/api/auth/oauth/url", "POST", { provider, redirectUrl, state });
    },

    async handleOAuthCallback(provider, code, state) {
      if (isMock) {
        return createMockResult("oauth@example.com");
      }
      return request<AuthResult>("/api/auth/oauth/callback", "POST", { provider, code, state });
    },

    async linkProvider(userId, provider, code, state) {
      if (isMock) {
        return createMockResult("oauth@example.com").user;
      }
      return request<AuthUser>("/api/auth/oauth/link", "POST", { userId, provider, code, state });
    },

    async unlinkProvider(userId, provider) {
      if (isMock) {
        return createMockResult("oauth@example.com").user;
      }
      return request<AuthUser>("/api/auth/oauth/unlink", "POST", { userId, provider });
    },

    async createOrganization(userId, data) {
      if (isMock) {
        const organization: AuthOrganization = {
          id: "org_mock_better_auth",
          name: data.name,
          slug: data.slug ?? "mock-org",
          logo: data.logo ?? null,
          ownerId: userId,
          metadata: data.metadata ?? {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return organization;
      }
      return request<AuthOrganization>("/api/auth/organization/create", "POST", {
        userId,
        ...data,
      });
    },

    async getOrganization(orgId) {
      if (isMock) {
        if (orgId === "org_mock_better_auth") {
          return {
            id: "org_mock_better_auth",
            name: "Mock Organization",
            slug: "mock-org",
            logo: null,
            ownerId: "usr_mock_better_auth",
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        return null;
      }
      return request<AuthOrganization | null>(
        `/api/auth/organization?orgId=${encodeURIComponent(orgId)}`,
        "GET"
      );
    },

    async updateOrganization(orgId, data) {
      if (isMock) {
        return {
          id: orgId,
          name: data.name ?? "Updated Mock Org",
          slug: data.slug ?? "mock-org",
          logo: data.logo ?? null,
          ownerId: "usr_mock_better_auth",
          metadata: data.metadata ?? {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return request<AuthOrganization>("/api/auth/organization/update", "POST", { orgId, ...data });
    },

    async deleteOrganization(orgId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/organization/delete", "POST", { orgId });
    },

    async getOrganizationMembers(orgId) {
      if (isMock) {
        return [];
      }
      return request<readonly AuthOrganizationMember[]>(
        `/api/auth/organization/members?orgId=${encodeURIComponent(orgId)}`,
        "GET"
      );
    },

    async inviteToOrganization(orgId, email, role) {
      if (isMock) {
        const invitation: AuthInvitation = {
          id: "invite_mock_better_auth",
          email,
          role,
          token: "tok_mock_better_auth_invite",
          status: "pending",
          invitedBy: "usr_mock_better_auth",
          organizationId: orgId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        };
        return invitation;
      }
      return request<AuthInvitation>("/api/auth/organization/invite", "POST", {
        orgId,
        email,
        role,
      });
    },

    async acceptInvitation(token) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/organization/accept-invitation", "POST", { token });
    },

    async removeFromOrganization(orgId, userId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/organization/remove-member", "POST", { orgId, userId });
    },

    async switchOrganization(userId, orgId) {
      if (isMock) {
        return;
      }
      await request<void>("/api/auth/organization/switch", "POST", { userId, orgId });
    },
  };
}
