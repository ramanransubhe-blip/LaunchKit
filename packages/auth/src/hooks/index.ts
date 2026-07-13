import {
  useAuthClient,
  useAuthClientState,
  type AuthClient,
  type AuthClientState,
} from "../client/index.js";
import type { Permission } from "../types/index.js";

/** Result returned by `useAuth`. */
export interface UseAuthResult extends AuthClientState {
  /** Auth client instance. */
  client: AuthClient;
  /** Sign in action. */
  signIn: AuthClient["signIn"];
  /** Sign up action. */
  signUp: AuthClient["signUp"];
  /** Sign out action. */
  signOut: AuthClient["signOut"];
  /** Refresh a session. */
  refreshSession: AuthClient["refreshSession"];
  /** Reset the client state. */
  reset: AuthClient["reset"];
}

/** Result returned by `useSession`. */
export interface UseSessionResult {
  /** Current session. */
  session: AuthClientState["session"];
  /** Client status. */
  status: AuthClientState["status"];
  /** Last error, if any. */
  error: AuthClientState["error"];
  /** Refresh a session. */
  refreshSession: AuthClient["refreshSession"];
  /** Sign out action. */
  signOut: AuthClient["signOut"];
}

/** Result returned by `useUser`. */
export interface UseUserResult {
  /** Current user. */
  user: AuthClientState["user"];
  /** Current status. */
  status: AuthClientState["status"];
  /** Update the profile. */
  updateProfile: AuthClient["updateProfile"];
  /** Delete the account. */
  deleteAccount: AuthClient["deleteAccount"];
  /** Link a provider account. */
  linkProvider: AuthClient["linkProvider"];
  /** Unlink a provider account. */
  unlinkProvider: AuthClient["unlinkProvider"];
}

/** Result returned by `usePermissions`. */
export interface UsePermissionsResult {
  /** Effective permission list. */
  permissions: readonly Permission[];
  /** Whether the current user has a permission. */
  hasPermission(permission: Permission): boolean;
  /** Whether the current user has any permission from the list. */
  hasAnyPermission(permissions: readonly Permission[]): boolean;
  /** Whether the current user is authenticated. */
  isAuthenticated: boolean;
}

/** Result returned by `useOrganization`. */
export interface UseOrganizationResult {
  /** Current organization. */
  organization: AuthClientState["organization"];
  /** Create an organization. */
  createOrganization: AuthClient["createOrganization"];
  /** Update an organization. */
  updateOrganization: AuthClient["updateOrganization"];
  /** Delete an organization. */
  deleteOrganization: AuthClient["deleteOrganization"];
  /** Invite a member. */
  inviteToOrganization: AuthClient["inviteToOrganization"];
  /** Accept an invitation. */
  acceptInvitation: AuthClient["acceptInvitation"];
  /** Remove a member. */
  removeFromOrganization: AuthClient["removeFromOrganization"];
  /** Switch the current organization. */
  switchOrganization: AuthClient["switchOrganization"];
}

/**
 * Returns the full auth state and auth actions.
 *
 * @returns Full auth hook result.
 */
export function useAuth(): UseAuthResult {
  const client = useAuthClient();
  const state = useAuthClientState();
  return {
    ...state,
    client,
    signIn: client.signIn,
    signUp: client.signUp,
    signOut: client.signOut,
    refreshSession: client.refreshSession,
    reset: client.reset,
  };
}

/**
 * Returns the current session slice.
 *
 * @returns Session hook result.
 */
export function useSession(): UseSessionResult {
  const client = useAuthClient();
  const { session, status, error } = useAuthClientState();
  return {
    session,
    status,
    error,
    refreshSession: client.refreshSession,
    signOut: client.signOut,
  };
}

/**
 * Returns the current user slice.
 *
 * @returns User hook result.
 */
export function useUser(): UseUserResult {
  const client = useAuthClient();
  const { user, status } = useAuthClientState();
  return {
    user,
    status,
    updateProfile: client.updateProfile,
    deleteAccount: client.deleteAccount,
    linkProvider: client.linkProvider,
    unlinkProvider: client.unlinkProvider,
  };
}

/**
 * Returns the current permission slice.
 *
 * @returns Permission hook result.
 */
export function usePermissions(): UsePermissionsResult {
  const { user, permissions } = useAuthClientState();
  const currentPermissions = permissions;
  return {
    permissions: currentPermissions,
    hasPermission(permission) {
      return currentPermissions.includes(permission);
    },
    hasAnyPermission(permissionList) {
      return permissionList.some((permission) =>
        currentPermissions.includes(permission),
      );
    },
    isAuthenticated: Boolean(user),
  };
}

/**
 * Returns the current organization slice.
 *
 * @returns Organization hook result.
 */
export function useOrganization(): UseOrganizationResult {
  const client = useAuthClient();
  const { organization } = useAuthClientState();
  return {
    organization,
    createOrganization: client.createOrganization,
    updateOrganization: client.updateOrganization,
    deleteOrganization: client.deleteOrganization,
    inviteToOrganization: client.inviteToOrganization,
    acceptInvitation: client.acceptInvitation,
    removeFromOrganization: client.removeFromOrganization,
    switchOrganization: client.switchOrganization,
  };
}

