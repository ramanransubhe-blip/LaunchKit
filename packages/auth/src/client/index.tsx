"use client";

import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useSyncExternalStore,
} from "react";
import type {
  AuthInvitation,
  AuthOrganization,
  AuthOrganizationMember,
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

/** Request map used by the client transport. */
export interface AuthClientRequestMap {
  signIn: SignInCredentials;
  signUp: SignUpData;
  signOut: { sessionId?: string };
  getSession: { token: string };
  refreshSession: { token: string };
  invalidateSession: { sessionId: string };
  invalidateAllSessions: { userId: string };
  getActiveSessions: { userId: string };
  getUser: { userId: string };
  getUserByEmail: { email: string };
  updateProfile: { userId: string; data: UpdateUserData };
  updateUser: { userId: string; data: UpdateUserData };
  deleteAccount: { userId: string };
  deleteUser: { userId: string };
  sendVerificationEmail: { userId: string };
  verifyEmail: { token: string };
  forgotPassword: { email: string };
  resetPassword: { token: string; newPassword: string };
  changePassword: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  };
  sendMagicLink: { email: string };
  verifyMagicLink: { token: string };
  getOAuthUrl: {
    provider: OAuthProvider;
    redirectUrl: string;
    state?: string;
  };
  handleOAuthCallback: {
    provider: OAuthProvider;
    code: string;
    state?: string;
  };
  linkProvider: {
    userId: string;
    provider: OAuthProvider;
    code: string;
    state?: string;
  };
  unlinkProvider: { userId: string; provider: OAuthProvider };
  createOrganization: { userId: string; data: CreateOrganizationData };
  getOrganization: { orgId: string };
  updateOrganization: { orgId: string; data: UpdateOrganizationData };
  deleteOrganization: { orgId: string };
  getOrganizationMembers: { orgId: string };
  inviteToOrganization: {
    orgId: string;
    email: string;
    role: OrganizationRole;
  };
  acceptInvitation: { token: string };
  removeFromOrganization: { orgId: string; userId: string };
  switchOrganization: { userId: string; orgId: string };
}

/** Response map used by the client transport. */
export interface AuthClientResponseMap {
  signIn: AuthResult;
  signUp: AuthResult;
  signOut: void;
  getSession: AuthSession | null;
  refreshSession: AuthSession;
  invalidateSession: void;
  invalidateAllSessions: void;
  getActiveSessions: readonly AuthSession[];
  getUser: AuthUser | null;
  getUserByEmail: AuthUser | null;
  updateProfile: AuthUser;
  updateUser: AuthUser;
  deleteAccount: void;
  deleteUser: void;
  sendVerificationEmail: void;
  verifyEmail: void;
  forgotPassword: void;
  resetPassword: void;
  changePassword: void;
  sendMagicLink: void;
  verifyMagicLink: AuthResult;
  getOAuthUrl: string;
  handleOAuthCallback: AuthResult;
  linkProvider: AuthUser;
  unlinkProvider: AuthUser;
  createOrganization: AuthOrganization;
  getOrganization: AuthOrganization | null;
  updateOrganization: AuthOrganization;
  deleteOrganization: void;
  getOrganizationMembers: readonly AuthOrganizationMember[];
  inviteToOrganization: AuthInvitation;
  acceptInvitation: void;
  removeFromOrganization: void;
  switchOrganization: void;
}

/** Operation names supported by the auth client. */
export type AuthClientOperation = keyof AuthClientRequestMap;

/** Transport used by the auth client. */
export interface AuthClientTransport {
  /** Sends a typed operation to the backend. */
  request<K extends AuthClientOperation>(
    operation: K,
    input: AuthClientRequestMap[K]
  ): Promise<AuthClientResponseMap[K]>;
}

/** Client status used by auth hooks. */
export type AuthClientStatus = "anonymous" | "authenticated" | "loading" | "error";

/** Snapshot of the current client state. */
export interface AuthClientState {
  /** Current user, if authenticated. */
  user: AuthUser | null;
  /** Current session, if authenticated. */
  session: AuthSession | null;
  /** Current organization, if selected. */
  organization: AuthOrganization | null;
  /** Effective permissions for the current user. */
  permissions: readonly Permission[];
  /** Client status. */
  status: AuthClientStatus;
  /** Last client-side error, if any. */
  error: Error | null;
}

/** Client-side auth abstraction. */
export interface AuthClient {
  /** Current provider family. */
  readonly provider: AuthProviderType | null;
  /** Resolve the current state snapshot. */
  getState(): AuthClientState;
  /** Subscribe to state updates. */
  subscribe(listener: () => void): () => void;
  /** Replace the current state snapshot. */
  hydrate(state: Partial<AuthClientState>): void;
  /** Reset the client to the anonymous state. */
  reset(): void;

  /** Sign in with email and password. */
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  /** Sign up with email and password. */
  signUp(data: SignUpData): Promise<AuthResult>;
  /** Sign out the current session. */
  signOut(sessionId?: string): Promise<void>;
  /** Fetch a session by token. */
  getSession(token: string): Promise<AuthSession | null>;
  /** Refresh a session token. */
  refreshSession(token: string): Promise<AuthSession>;
  /** Revoke a specific session. */
  invalidateSession(sessionId: string): Promise<void>;
  /** Revoke every session for a user. */
  invalidateAllSessions(userId: string): Promise<void>;
  /** List active sessions for a user. */
  getActiveSessions(userId: string): Promise<readonly AuthSession[]>;
  /** Fetch a user by identifier. */
  getUser(userId: string): Promise<AuthUser | null>;
  /** Fetch a user by email. */
  getUserByEmail(email: string): Promise<AuthUser | null>;
  /** Update a profile. */
  updateProfile(userId: string, data: UpdateUserData): Promise<AuthUser>;
  /** Update a profile alias. */
  updateUser(userId: string, data: UpdateUserData): Promise<AuthUser>;
  /** Delete an account. */
  deleteAccount(userId: string): Promise<void>;
  /** Delete an account alias. */
  deleteUser(userId: string): Promise<void>;
  /** Send an email verification link. */
  sendVerificationEmail(userId: string): Promise<void>;
  /** Verify an email token. */
  verifyEmail(token: string): Promise<void>;
  /** Send a password-reset email. */
  forgotPassword(email: string): Promise<void>;
  /** Reset a password. */
  resetPassword(token: string, newPassword: string): Promise<void>;
  /** Change a password. */
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  /** Send a magic-link email. */
  sendMagicLink(email: string): Promise<void>;
  /** Verify a magic-link token. */
  verifyMagicLink(token: string): Promise<AuthResult>;
  /** Build an OAuth authorization URL. */
  getOAuthUrl(provider: OAuthProvider, redirectUrl: string, state?: string): Promise<string>;
  /** Handle an OAuth callback. */
  handleOAuthCallback(provider: OAuthProvider, code: string, state?: string): Promise<AuthResult>;
  /** Link a provider account. */
  linkProvider(
    userId: string,
    provider: OAuthProvider,
    code: string,
    state?: string
  ): Promise<AuthUser>;
  /** Unlink a provider account. */
  unlinkProvider(userId: string, provider: OAuthProvider): Promise<AuthUser>;
  /** Create an organization. */
  createOrganization(userId: string, data: CreateOrganizationData): Promise<AuthOrganization>;
  /** Fetch an organization by identifier. */
  getOrganization(orgId: string): Promise<AuthOrganization | null>;
  /** Update an organization. */
  updateOrganization(orgId: string, data: UpdateOrganizationData): Promise<AuthOrganization>;
  /** Delete an organization. */
  deleteOrganization(orgId: string): Promise<void>;
  /** List organization members. */
  getOrganizationMembers(orgId: string): Promise<readonly AuthOrganizationMember[]>;
  /** Invite a member to an organization. */
  inviteToOrganization(
    orgId: string,
    email: string,
    role: OrganizationRole
  ): Promise<AuthInvitation>;
  /** Accept an organization invitation. */
  acceptInvitation(token: string): Promise<void>;
  /** Remove a user from an organization. */
  removeFromOrganization(orgId: string, userId: string): Promise<void>;
  /** Switch the current organization. */
  switchOrganization(userId: string, orgId: string): Promise<void>;
}

/** Internal client context. */
const AuthClientContext = createContext<AuthClient | null>(null);

/**
 * Creates a client-side auth store.
 *
 * @param transport - Transport used to call the backend.
 * @param provider - Provider family, if known.
 * @param initialState - Optional initial state snapshot.
 * @returns Auth client instance.
 */
export function createAuthClient(
  transport: AuthClientTransport,
  provider: AuthProviderType | null = null,
  initialState: Partial<AuthClientState> = {}
): AuthClient {
  let state: AuthClientState = {
    user: null,
    session: null,
    organization: null,
    permissions: [],
    status: "anonymous",
    error: null,
    ...initialState,
  };

  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function setState(nextState: AuthClientState): void {
    state = nextState;
    notify();
  }

  function patchState(patch: Partial<AuthClientState>): void {
    state = {
      ...state,
      ...patch,
    };
    notify();
  }

  function setAuthenticated(result: AuthResult): void {
    state = {
      user: result.user,
      session: result.session,
      organization: result.organization,
      permissions: result.user.permissions,
      status: "authenticated",
      error: null,
    };
    notify();
  }

  function setAnonymous(): void {
    state = {
      user: null,
      session: null,
      organization: null,
      permissions: [],
      status: "anonymous",
      error: null,
    };
    notify();
  }

  async function request<K extends AuthClientOperation>(
    operation: K,
    input: AuthClientRequestMap[K]
  ): Promise<AuthClientResponseMap[K]> {
    try {
      return await transport.request(operation, input);
    } catch (error) {
      patchState({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  return {
    provider,
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    hydrate(nextState) {
      setState({
        ...state,
        ...nextState,
        status: nextState.status ?? state.status,
        error: nextState.error ?? state.error,
      });
    },
    reset() {
      setAnonymous();
    },
    async signIn(credentials) {
      const result = await request("signIn", credentials);
      setAuthenticated(result);
      return result;
    },
    async signUp(data) {
      const result = await request("signUp", data);
      setAuthenticated(result);
      return result;
    },
    async signOut(sessionId) {
      await request("signOut", { sessionId });
      setAnonymous();
    },
    async getSession(token) {
      return request("getSession", { token });
    },
    async refreshSession(token) {
      const session = await request("refreshSession", { token });
      patchState({
        session,
        status: state.user ? "authenticated" : "anonymous",
      });
      return session;
    },
    async invalidateSession(sessionId) {
      await request("invalidateSession", { sessionId });
      if (state.session?.id === sessionId) {
        setAnonymous();
      }
    },
    async invalidateAllSessions(userId) {
      await request("invalidateAllSessions", { userId });
      if (state.user?.id === userId) {
        setAnonymous();
      }
    },
    async getActiveSessions(userId) {
      return request("getActiveSessions", { userId });
    },
    async getUser(userId) {
      return request("getUser", { userId });
    },
    async getUserByEmail(email) {
      return request("getUserByEmail", { email });
    },
    async updateProfile(userId, data) {
      const user = await request("updateProfile", { userId, data });
      if (state.user?.id === userId) {
        patchState({ user });
      }
      return user;
    },
    async updateUser(userId, data) {
      const user = await request("updateUser", { userId, data });
      if (state.user?.id === userId) {
        patchState({ user });
      }
      return user;
    },
    async deleteAccount(userId) {
      await request("deleteAccount", { userId });
      if (state.user?.id === userId) {
        setAnonymous();
      }
    },
    async deleteUser(userId) {
      await request("deleteUser", { userId });
      if (state.user?.id === userId) {
        setAnonymous();
      }
    },
    async sendVerificationEmail(userId) {
      await request("sendVerificationEmail", { userId });
    },
    async verifyEmail(token) {
      await request("verifyEmail", { token });
    },
    async forgotPassword(email) {
      await request("forgotPassword", { email });
    },
    async resetPassword(token, newPassword) {
      await request("resetPassword", { token, newPassword });
    },
    async changePassword(userId, currentPassword, newPassword) {
      await request("changePassword", {
        userId,
        currentPassword,
        newPassword,
      });
    },
    async sendMagicLink(email) {
      await request("sendMagicLink", { email });
    },
    async verifyMagicLink(token) {
      const result = await request("verifyMagicLink", { token });
      setAuthenticated(result);
      return result;
    },
    async getOAuthUrl(provider, redirectUrl, stateValue) {
      return request("getOAuthUrl", {
        provider,
        redirectUrl,
        state: stateValue,
      });
    },
    async handleOAuthCallback(provider, code, stateValue) {
      const result = await request("handleOAuthCallback", {
        provider,
        code,
        state: stateValue,
      });
      setAuthenticated(result);
      return result;
    },
    async linkProvider(userId, provider, code, stateValue) {
      const user = await request("linkProvider", {
        userId,
        provider,
        code,
        state: stateValue,
      });
      if (state.user?.id === userId) {
        patchState({ user });
      }
      return user;
    },
    async unlinkProvider(userId, provider) {
      const user = await request("unlinkProvider", { userId, provider });
      if (state.user?.id === userId) {
        patchState({ user });
      }
      return user;
    },
    async createOrganization(userId, data) {
      const organization = await request("createOrganization", {
        userId,
        data,
      });
      patchState({ organization });
      return organization;
    },
    async getOrganization(orgId) {
      return request("getOrganization", { orgId });
    },
    async updateOrganization(orgId, data) {
      const organization = await request("updateOrganization", {
        orgId,
        data,
      });
      if (state.organization?.id === orgId) {
        patchState({ organization });
      }
      return organization;
    },
    async deleteOrganization(orgId) {
      await request("deleteOrganization", { orgId });
      if (state.organization?.id === orgId) {
        patchState({ organization: null });
      }
    },
    async getOrganizationMembers(orgId) {
      return request("getOrganizationMembers", { orgId });
    },
    async inviteToOrganization(orgId, email, role) {
      return request("inviteToOrganization", { orgId, email, role });
    },
    async acceptInvitation(token) {
      await request("acceptInvitation", { token });
    },
    async removeFromOrganization(orgId, userId) {
      await request("removeFromOrganization", { orgId, userId });
      if (state.organization?.id === orgId) {
        patchState({ organization: null });
      }
    },
    async switchOrganization(userId, orgId) {
      await request("switchOrganization", { userId, orgId });
      if (state.user?.id === userId) {
        patchState({
          user: state.user ? { ...state.user, organizationId: orgId } : state.user,
          organization: state.organization?.id === orgId ? state.organization : null,
        });
      }
    },
  };
}

/**
 * Auth client provider used by the hook layer.
 *
 * @param props - Provider props.
 * @returns React provider.
 */
export function AuthClientProvider({
  client,
  children,
}: {
  client: AuthClient;
  children: ReactNode;
}): ReactElement {
  return <AuthClientContext.Provider value={client}>{children}</AuthClientContext.Provider>;
}

/**
 * Returns the active auth client from React context.
 *
 * @returns Auth client instance.
 */
export function useAuthClient(): AuthClient {
  const client = useContext(AuthClientContext);
  if (!client) {
    throw new Error("AuthClientProvider is missing.");
  }
  return client;
}

/**
 * Subscribes to the auth client state snapshot.
 *
 * @returns Current client state.
 */
export function useAuthClientState(): AuthClientState {
  const client = useAuthClient();
  return useSyncExternalStore(client.subscribe, client.getState, client.getState);
}

export * from "./transport.js";
