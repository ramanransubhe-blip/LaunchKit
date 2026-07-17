import type { ClerkServiceBridge } from "./index.js";
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

/** Configuration options for the Clerk bridge. */
export interface ClerkBridgeOptions {
  baseUrl?: string;
  secret: string;
  isMock?: boolean;
}

/**
 * Creates a Clerk Service Bridge.
 */
export function createClerkBridge(options: ClerkBridgeOptions): ClerkServiceBridge {
  const { baseUrl = "https://api.clerk.com/v1", secret, isMock = false } = options;

  async function request<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    if (isMock) {
      throw new AuthProviderError("Clerk API not configured in mock mode.");
    }

    try {
      const url = `${baseUrl}${path}`;
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
        throw new AuthProviderError(`Clerk API request failed (${response.status}): ${errorText}`, {
          status: response.status,
        });
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AuthProviderError) {
        throw error;
      }
      throw new AuthProviderError(
        `Failed to execute Clerk request: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Simulated fallback helper when mock mode is enabled
  function createMockResult(email: string, name = "Clerk User"): AuthResult {
    const user: AuthUser = {
      id: "usr_mock_clerk",
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
      id: "sess_mock_clerk",
      token: "tok_mock_clerk",
      userId: user.id,
      userAgent: "mock-agent",
      ipAddress: "127.0.0.1",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      device: null,
      organizationId: null,
      isActive: true,
      rememberMe: false,
      provider: AuthProviderType.Clerk,
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
      return request<AuthResult>("/users/verify-password", "POST", credentials);
    },

    async signUp(data) {
      if (isMock) {
        return createMockResult(data.email, data.name);
      }
      return request<AuthResult>("/users", "POST", data);
    },

    async signOut(sessionId) {
      if (isMock) {
        return;
      }
      await request<void>(`/sessions/${sessionId}/revoke`, "POST");
    },

    async getSession(token) {
      if (isMock) {
        if (token === "tok_mock_clerk") {
          return createMockResult("test@example.com").session;
        }
        return null;
      }
      return request<AuthSession | null>(`/sessions/${token}`, "GET");
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
      return request<AuthSession>(`/sessions/${token}/refresh`, "POST");
    },

    async invalidateSession(sessionId) {
      if (isMock) {
        return;
      }
      await request<void>(`/sessions/${sessionId}/revoke`, "POST");
    },

    async invalidateAllSessions(userId) {
      if (isMock) {
        return;
      }
      await request<void>(`/users/${userId}/sessions/revoke`, "POST");
    },

    async getActiveSessions(userId) {
      if (isMock) {
        return [createMockResult("test@example.com").session];
      }
      return request<readonly AuthSession[]>(`/users/${userId}/sessions`, "GET");
    },

    async getUser(userId) {
      if (isMock) {
        if (userId === "usr_mock_clerk") {
          return createMockResult("test@example.com").user;
        }
        return null;
      }
      return request<AuthUser | null>(`/users/${userId}`, "GET");
    },

    async getUserByEmail(email) {
      if (isMock) {
        return createMockResult(email).user;
      }
      return request<AuthUser | null>(`/users?email_address=${encodeURIComponent(email)}`, "GET");
    },

    async updateProfile(userId, data) {
      if (isMock) {
        const user = createMockResult("test@example.com").user;
        return { ...user, ...data, updatedAt: new Date() };
      }
      return request<AuthUser>(`/users/${userId}`, "PUT", data);
    },

    async updateUser(userId, data) {
      if (isMock) {
        const user = createMockResult("test@example.com").user;
        return { ...user, ...data, updatedAt: new Date() };
      }
      return request<AuthUser>(`/users/${userId}`, "PUT", data);
    },

    async deleteAccount(userId) {
      if (isMock) {
        return;
      }
      await request<void>(`/users/${userId}`, "DELETE");
    },

    async deleteUser(userId) {
      if (isMock) {
        return;
      }
      await request<void>(`/users/${userId}`, "DELETE");
    },

    async sendVerificationEmail(userId) {
      if (isMock) {
        return;
      }
      await request<void>(`/users/${userId}/verify-email`, "POST");
    },

    async verifyEmail(token) {
      if (isMock) {
        return;
      }
      await request<void>("/email-verification", "POST", { token });
    },

    async forgotPassword(email) {
      if (isMock) {
        return;
      }
      await request<void>("/passwords/forgot", "POST", { email });
    },

    async resetPassword(token, newPassword) {
      if (isMock) {
        return;
      }
      await request<void>("/passwords/reset", "POST", { token, newPassword });
    },

    async changePassword(userId, currentPassword, newPassword) {
      if (isMock) {
        return;
      }
      await request<void>(`/users/${userId}/change-password`, "POST", {
        currentPassword,
        newPassword,
      });
    },

    async sendMagicLink(email) {
      if (isMock) {
        return;
      }
      await request<void>("/magic-links", "POST", { email });
    },

    async verifyMagicLink(token) {
      if (isMock) {
        return createMockResult("magic@example.com");
      }
      return request<AuthResult>("/magic-links/verify", "POST", { token });
    },

    async getOAuthUrl(provider, redirectUrl, state) {
      if (isMock) {
        return `https://mock-clerk.com/oauth/${provider}?redirect=${encodeURIComponent(redirectUrl)}`;
      }
      return request<string>("/oauth/url", "POST", { provider, redirectUrl, state });
    },

    async handleOAuthCallback(provider, code, state) {
      if (isMock) {
        return createMockResult("oauth@example.com");
      }
      return request<AuthResult>("/oauth/callback", "POST", { provider, code, state });
    },

    async linkProvider(userId, provider, code, state) {
      if (isMock) {
        return createMockResult("oauth@example.com").user;
      }
      return request<AuthUser>(`/users/${userId}/oauth/link`, "POST", { provider, code, state });
    },

    async unlinkProvider(userId, provider) {
      if (isMock) {
        return createMockResult("oauth@example.com").user;
      }
      return request<AuthUser>(`/users/${userId}/oauth/unlink`, "POST", { provider });
    },

    async createOrganization(userId, data) {
      if (isMock) {
        const organization: AuthOrganization = {
          id: "org_mock_clerk",
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
      return request<AuthOrganization>("/organizations", "POST", { userId, ...data });
    },

    async getOrganization(orgId) {
      if (isMock) {
        if (orgId === "org_mock_clerk") {
          return {
            id: "org_mock_clerk",
            name: "Mock Clerk Org",
            slug: "mock-org",
            logo: null,
            ownerId: "usr_mock_clerk",
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        return null;
      }
      return request<AuthOrganization | null>(`/organizations/${orgId}`, "GET");
    },

    async updateOrganization(orgId, data) {
      if (isMock) {
        return {
          id: orgId,
          name: data.name ?? "Updated Clerk Org",
          slug: data.slug ?? "mock-org",
          logo: data.logo ?? null,
          ownerId: "usr_mock_clerk",
          metadata: data.metadata ?? {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return request<AuthOrganization>(`/organizations/${orgId}`, "PUT", data);
    },

    async deleteOrganization(orgId) {
      if (isMock) {
        return;
      }
      await request<void>(`/organizations/${orgId}`, "DELETE");
    },

    async getOrganizationMembers(orgId) {
      if (isMock) {
        return [];
      }
      return request<readonly AuthOrganizationMember[]>(
        `/organizations/${orgId}/memberships`,
        "GET"
      );
    },

    async inviteToOrganization(orgId, email, role) {
      if (isMock) {
        const invitation: AuthInvitation = {
          id: "invite_mock_clerk",
          email,
          role,
          token: "tok_mock_clerk_invite",
          status: "pending",
          invitedBy: "usr_mock_clerk",
          organizationId: orgId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        };
        return invitation;
      }
      return request<AuthInvitation>(`/organizations/${orgId}/invitations`, "POST", {
        email,
        role,
      });
    },

    async acceptInvitation(token) {
      if (isMock) {
        return;
      }
      await request<void>(`/invitations/${token}/accept`, "POST");
    },

    async removeFromOrganization(orgId, userId) {
      if (isMock) {
        return;
      }
      await request<void>(`/organizations/${orgId}/memberships/${userId}`, "DELETE");
    },

    async switchOrganization(userId, orgId) {
      if (isMock) {
        return;
      }
      // Clerk organization switching is handled client-side or during session configuration updates
      await request<void>(`/users/${userId}/active-organization`, "POST", {
        organizationId: orgId,
      });
    },
  };
}
