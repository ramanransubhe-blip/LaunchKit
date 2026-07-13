import { randomUUID } from "node:crypto";
import type {
  AuthAccountLock,
  AuthAuditRecord,
  AuthLoginAttempt,
  AuthRepository,
  AuthService,
  AuthServiceDependencies,
} from "./contracts.js";
import { AuthSecurityError, AuthWeakPasswordError, isAuthError, toAuthError } from "./errors.js";
import {
  evaluatePasswordStrength,
  detectSuspiciousLogin,
  type LoginSignal,
  type PasswordPolicy,
} from "../security/index.js";
import { AuthEventType } from "../types/index.js";
import type { AuthEventMap } from "../events/index.js";
import type {
  AuthActionMetadata,
  AuthInvitation,
  AuthOrganization,
  AuthResult,
  AuthSession,
  AuthUser,
  CreateOrganizationData,
  OAuthProvider,
  OrganizationRole,
  SignInCredentials,
  SignUpData,
  UpdateOrganizationData,
  UpdateUserData,
} from "../types/index.js";

/** Options used when decorating a raw auth service. */
export interface AuthServiceFactoryOptions extends AuthServiceDependencies {
  /** Optional password policy override. */
  passwordPolicy?: Partial<PasswordPolicy>;
}

const DEFAULT_LOCKOUT_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_DURATION_SECONDS = 15 * 60;

/**
 * Creates a decorated auth service from a raw provider implementation.
 *
 * @param base - Raw auth service implementation.
 * @param options - Runtime dependencies and policy configuration.
 * @returns Decorated auth service.
 *
 * @example
 * ```ts
 * const auth = createAuthService(createBetterAuthProvider(client), {
 *   repository,
 *   events,
 *   config,
 * });
 * ```
 */
export function createAuthService(
  base: AuthService,
  options: AuthServiceFactoryOptions = {},
): AuthService {
  const repository = options.repository ?? null;
  const events = options.events ?? null;
  const config = options.config ?? null;
  const now = options.now ?? (() => new Date());
  const passwordPolicy = options.passwordPolicy ?? {};

  async function emit<K extends keyof AuthEventMap>(
    event: K,
    payload: AuthEventMap[K],
  ): Promise<void> {
    if (!events) {
      return;
    }
    await events.emit(event, payload);
  }

  async function recordAudit(
    type: string,
    userId: string,
    payload: Readonly<Record<string, unknown>>,
    metadata: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    if (!repository) {
      return;
    }

    const record: AuthAuditRecord = {
      id: randomUUID(),
      type,
      userId,
      payload,
      metadata,
      createdAt: now(),
    };

    await repository.recordAuditEvent(record);
  }

  async function recordLoginAttempt(
    attempt: Omit<AuthLoginAttempt, "createdAt">,
  ): Promise<void> {
    if (!repository) {
      return;
    }

    await repository.recordLoginAttempt({
      ...attempt,
      createdAt: now(),
    });
  }

  async function assertNotLocked(email: string): Promise<void> {
    if (!repository) {
      return;
    }

    const lock = await repository.getAccountLock(email);
    if (!lock) {
      return;
    }

    if (lock.lockedUntil.getTime() > now().getTime()) {
      throw new AuthSecurityError("Account is temporarily locked.", {
        email,
        lockedUntil: lock.lockedUntil.toISOString(),
        reason: lock.reason,
      });
    }

    await repository.clearAccountLock(email);
  }

  async function maybeLockAccount(email: string): Promise<AuthAccountLock | null> {
    if (!repository || !config?.security) {
      return null;
    }

    const maxAttempts =
      config.security.maxLoginAttempts ?? DEFAULT_LOCKOUT_ATTEMPTS;
    const lockoutDuration =
      config.security.lockoutDuration ?? DEFAULT_LOCKOUT_DURATION_SECONDS;
    const failedAttempts = await repository.countFailedLoginAttempts(
      email,
      new Date(now().getTime() - lockoutDuration * 1000),
    );

    if (failedAttempts < maxAttempts) {
      return null;
    }

    const lock: AuthAccountLock = {
      email,
      lockedUntil: new Date(now().getTime() + lockoutDuration * 1000),
      reason: `Too many failed login attempts (${failedAttempts}).`,
      createdAt: now(),
    };
    await repository.setAccountLock(lock);
    await emit(AuthEventType.AccountLocked, {
      email,
      lockedUntil: lock.lockedUntil,
      reason: lock.reason,
    });
    await recordAudit(
      "auth.account.locked",
      email,
      {
        failedAttempts,
        lockedUntil: lock.lockedUntil.toISOString(),
      },
      {},
    );
    return lock;
  }

  async function onSuccessfulLogin(
    result: AuthResult,
    meta: AuthActionMetadata | null,
    rememberMe: boolean,
  ): Promise<void> {
    if (repository) {
      await repository.clearAccountLock(result.user.email);
      const previousDevices = await repository.listDevices(result.user.id);
      const device = meta?.deviceFingerprint
        ? {
            id: meta.deviceId ?? randomUUID(),
            fingerprint: meta.deviceFingerprint,
            userId: result.user.id,
            name: null,
            info: null,
            ipAddress: meta.ipAddress ?? null,
            userAgent: meta.userAgent ?? null,
            trusted: rememberMe,
            createdAt: now(),
            lastSeenAt: now(),
          }
        : null;

      if (device) {
        await repository.upsertDevice(device);
      }

      const previous = previousDevices.find((entry) => entry.trusted) ?? previousDevices[0] ?? null;
      const signal: LoginSignal = {
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null,
        deviceFingerprint: meta?.deviceFingerprint ?? null,
      };
      const assessment = detectSuspiciousLogin(
        previous
          ? {
              ipAddress: previous.ipAddress,
              userAgent: previous.userAgent,
              deviceFingerprint: previous.fingerprint,
            }
          : null,
        signal,
      );

      if (assessment.isSuspicious) {
        await emit(AuthEventType.SuspiciousLogin, {
          email: result.user.email,
          reasons: assessment.reasons,
          signal: {
            ipAddress: signal.ipAddress,
            userAgent: signal.userAgent,
            deviceFingerprint: signal.deviceFingerprint,
          },
        });
      }
    }

    await emit(AuthEventType.UserLoggedIn, {
      user: result.user,
      session: result.session,
      rememberMe,
    });
    await emit(AuthEventType.SessionCreated, { session: result.session });
    await recordAudit(
      "auth.sign_in",
      result.user.id,
      {
        sessionId: result.session.id,
        rememberMe,
      },
      {
        requestId: meta?.requestId ?? null,
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null,
      },
    );
  }

  function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  const service: AuthService = {
    provider: base.provider,

    async signIn(credentials: SignInCredentials): Promise<AuthResult> {
      const email = normalizeEmail(credentials.email);
      const meta = credentials.meta ?? null;
      await assertNotLocked(email);

      try {
        const result = await base.signIn({
          ...credentials,
          email,
        });
        await recordLoginAttempt({
          email,
          userId: result.user.id,
          success: true,
          failureReason: null,
          metadata: meta,
        });
        await onSuccessfulLogin(result, meta, credentials.rememberMe ?? false);
        return result;
      } catch (error) {
        const authError = isAuthError(error) ? error : toAuthError(error, "AUTH_PROVIDER_ERROR");
        await recordLoginAttempt({
          email,
          userId: null,
          success: false,
          failureReason: authError.message,
          metadata: meta,
        });
        await maybeLockAccount(email);
        throw authError;
      }
    },

    async signUp(data: SignUpData): Promise<AuthResult> {
      const policy = {
        minLength: config?.security?.minPasswordLength ?? 12,
        requireUppercase: config?.security?.requirePasswordComplexity ?? true,
        requireLowercase: config?.security?.requirePasswordComplexity ?? true,
        requireNumber: config?.security?.requirePasswordComplexity ?? true,
        requireSymbol: config?.security?.requirePasswordComplexity ?? true,
        rejectCommonPasswords: true,
        ...passwordPolicy,
      };
      const strength = evaluatePasswordStrength(data.password, policy);
      if (!strength.isStrong) {
        throw new AuthWeakPasswordError("Password does not meet the current policy.", {
          issues: strength.issues,
        });
      }

      const normalized = {
        ...data,
        email: normalizeEmail(data.email),
      };
      const result = await base.signUp(normalized);
      await emit(AuthEventType.UserRegistered, {
        user: result.user,
        session: result.session,
      });
      await recordAudit(
        "auth.sign_up",
        result.user.id,
        {
          sessionId: result.session.id,
        },
        {
          requestId: data.meta?.requestId ?? null,
        },
      );
      return result;
    },

    async signOut(sessionId?: string): Promise<void> {
      await base.signOut(sessionId);
      if (sessionId) {
        await emit(AuthEventType.UserLoggedOut, {
          sessionId,
          userId: null,
        });
        await emit(AuthEventType.SessionRevoked, {
          sessionId,
          userId: null,
        });
        await emit(AuthEventType.SessionInvalidated, {
          sessionId,
          userId: null,
        });
      }
    },

    getSession: base.getSession.bind(base),

    async refreshSession(token: string): Promise<AuthSession> {
      const session = await base.refreshSession(token);
      await emit(AuthEventType.SessionRefreshed, { session });
      return session;
    },

    async invalidateSession(sessionId: string): Promise<void> {
      await base.invalidateSession(sessionId);
      await emit(AuthEventType.SessionRevoked, {
        sessionId,
        userId: null,
      });
      await emit(AuthEventType.SessionInvalidated, {
        sessionId,
        userId: null,
      });
    },

    async invalidateAllSessions(userId: string): Promise<void> {
      const sessions = await base.getActiveSessions(userId);
      await base.invalidateAllSessions(userId);
      await Promise.all(
        sessions.map(async (session) => {
          await emit(AuthEventType.SessionRevoked, {
            sessionId: session.id,
            userId,
          });
          await emit(AuthEventType.SessionInvalidated, {
            sessionId: session.id,
            userId,
          });
        }),
      );
      await recordAudit(
        "auth.sessions.invalidate_all",
        userId,
        {
          sessionCount: sessions.length,
        },
        {},
      );
    },

    getActiveSessions: base.getActiveSessions.bind(base),

    getUser: base.getUser.bind(base),
    getUserByEmail: async (email: string): Promise<AuthUser | null> =>
      base.getUserByEmail(normalizeEmail(email)),

    async updateProfile(userId: string, data: UpdateUserData): Promise<AuthUser> {
      const previous = await base.getUser(userId);
      const user = await base.updateProfile(userId, {
        ...data,
        email: data.email ? normalizeEmail(data.email) : data.email,
      });
      await emit(AuthEventType.ProfileUpdated, {
        user,
        previous: previous
          ? (previous as unknown as Readonly<Record<string, unknown>>)
          : {},
      });
      await recordAudit(
        "auth.profile.update",
        userId,
        {
          userId,
        },
        {},
      );
      return user;
    },

    async updateUser(userId: string, data: UpdateUserData): Promise<AuthUser> {
      return service.updateProfile(userId, data);
    },

    async deleteAccount(userId: string): Promise<void> {
      await base.deleteAccount(userId);
      await emit(AuthEventType.AccountDeleted, { userId });
    },

    async deleteUser(userId: string): Promise<void> {
      await service.deleteAccount(userId);
    },

    sendVerificationEmail: base.sendVerificationEmail.bind(base),
    verifyEmail: base.verifyEmail.bind(base),
    forgotPassword: base.forgotPassword.bind(base),

    async resetPassword(token: string, newPassword: string): Promise<void> {
      const strength = evaluatePasswordStrength(newPassword, {
        minLength: config?.security?.minPasswordLength ?? 12,
        requireUppercase: config?.security?.requirePasswordComplexity ?? true,
        requireLowercase: config?.security?.requirePasswordComplexity ?? true,
        requireNumber: config?.security?.requirePasswordComplexity ?? true,
        requireSymbol: config?.security?.requirePasswordComplexity ?? true,
        rejectCommonPasswords: true,
        ...passwordPolicy,
      });
      if (!strength.isStrong) {
        throw new AuthWeakPasswordError("Password does not meet the current policy.", {
          issues: strength.issues,
        });
      }
      await base.resetPassword(token, newPassword);
      await emit(AuthEventType.PasswordReset, {
        userId: null,
        email: null,
      });
    },

    async changePassword(
      userId: string,
      currentPassword: string,
      newPassword: string,
    ): Promise<void> {
      const strength = evaluatePasswordStrength(newPassword, {
        minLength: config?.security?.minPasswordLength ?? 12,
        requireUppercase: config?.security?.requirePasswordComplexity ?? true,
        requireLowercase: config?.security?.requirePasswordComplexity ?? true,
        requireNumber: config?.security?.requirePasswordComplexity ?? true,
        requireSymbol: config?.security?.requirePasswordComplexity ?? true,
        rejectCommonPasswords: true,
        ...passwordPolicy,
      });
      if (!strength.isStrong) {
        throw new AuthWeakPasswordError("Password does not meet the current policy.", {
          issues: strength.issues,
        });
      }
      await base.changePassword(userId, currentPassword, newPassword);
      await emit(AuthEventType.PasswordChanged, { userId });
    },

    sendMagicLink: base.sendMagicLink.bind(base),

    async verifyMagicLink(token: string): Promise<AuthResult> {
      const result = await base.verifyMagicLink(token);
      await onSuccessfulLogin(result, null, false);
      return result;
    },

    async getOAuthUrl(
      provider: OAuthProvider,
      redirectUrl: string,
      state?: string,
    ): Promise<string> {
      return base.getOAuthUrl(provider, redirectUrl, state);
    },

    async handleOAuthCallback(
      provider: OAuthProvider,
      code: string,
      state?: string,
    ): Promise<AuthResult> {
      const result = await base.handleOAuthCallback(provider, code, state);
      await emit(AuthEventType.ProviderLinked, {
        userId: result.user.id,
        provider,
      });
      await onSuccessfulLogin(result, null, false);
      return result;
    },

    async linkProvider(
      userId: string,
      provider: OAuthProvider,
      code: string,
      state?: string,
    ): Promise<AuthUser> {
      const user = await base.linkProvider(userId, provider, code, state);
      await emit(AuthEventType.ProviderLinked, { userId, provider });
      return user;
    },

    async unlinkProvider(
      userId: string,
      provider: OAuthProvider,
    ): Promise<AuthUser> {
      const user = await base.unlinkProvider(userId, provider);
      await emit(AuthEventType.ProviderUnlinked, { userId, provider });
      return user;
    },

    async createOrganization(
      userId: string,
      data: CreateOrganizationData,
    ): Promise<AuthOrganization> {
      const organization = await base.createOrganization(userId, data);
      await emit(AuthEventType.OrganizationCreated, { organization });
      return organization;
    },

    getOrganization: base.getOrganization.bind(base),

    async updateOrganization(
      orgId: string,
      data: UpdateOrganizationData,
    ): Promise<AuthOrganization> {
      const organization = await base.updateOrganization(orgId, data);
      await emit(AuthEventType.OrganizationUpdated, { organization });
      return organization;
    },

    async deleteOrganization(orgId: string): Promise<void> {
      await base.deleteOrganization(orgId);
      await emit(AuthEventType.OrganizationDeleted, { organizationId: orgId });
    },

    getOrganizationMembers: base.getOrganizationMembers.bind(base),

    async inviteToOrganization(
      orgId: string,
      email: string,
      role: OrganizationRole,
    ): Promise<AuthInvitation> {
      const invitation = await base.inviteToOrganization(
        orgId,
        normalizeEmail(email),
        role,
      );
      await emit(AuthEventType.InvitationSent, { invitation });
      return invitation;
    },

    acceptInvitation: base.acceptInvitation.bind(base),

    async removeFromOrganization(orgId: string, userId: string): Promise<void> {
      await base.removeFromOrganization(orgId, userId);
      await emit(AuthEventType.OrganizationLeft, {
        organizationId: orgId,
        userId,
      });
    },

    async switchOrganization(userId: string, orgId: string): Promise<void> {
      await base.switchOrganization(userId, orgId);
      await emit(AuthEventType.OrganizationSwitched, {
        userId,
        organizationId: orgId,
      });
    },
  };

  return service;
}
