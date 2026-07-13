import {
  OrganizationRole,
  Permission,
  UserRole,
  type AnyRole,
  type OrganizationRole as OrganizationRoleType,
  type Permission as PermissionType,
  type UserRole as UserRoleType,
} from "../types/index.js";

/** Role definition used by the permission resolver. */
export interface RoleDefinition {
  /** Role identifier. */
  readonly role: AnyRole;
  /** Direct permissions granted to the role. */
  readonly permissions: readonly PermissionType[];
  /** Roles inherited by this role. */
  readonly inherits: readonly AnyRole[];
}

/** RBAC service returned by `createPermissionService`. */
export interface PermissionService {
  /** Resolve direct and inherited permissions for a role. */
  getPermissions(role: AnyRole): readonly PermissionType[];
  /** Resolve the full role hierarchy for a role. */
  getInheritedRoles(role: AnyRole): readonly AnyRole[];
  /** Check whether a role grants a permission. */
  hasPermission(role: AnyRole, permission: PermissionType): boolean;
  /** Check whether a role grants any permission from a list. */
  hasAnyPermission(role: AnyRole, permissions: readonly PermissionType[]): boolean;
  /** Compare two roles using the hierarchy graph. */
  isAtLeast(role: AnyRole, requiredRole: AnyRole): boolean;
  /** Resolve permissions for multiple roles at once. */
  resolvePermissions(roles: readonly AnyRole[]): readonly PermissionType[];
}

const ROLE_DEFINITIONS: Record<AnyRole, RoleDefinition> = {
  [UserRole.Guest]: {
    role: UserRole.Guest,
    permissions: [
      Permission.AuthSignIn,
      Permission.AuthSignUp,
      Permission.AuthMagicLinkSend,
      Permission.AuthPasswordForgot,
    ],
    inherits: [],
  },
  [UserRole.User]: {
    role: UserRole.User,
    permissions: [
      Permission.AuthSignOut,
      Permission.AuthSessionRead,
      Permission.AuthSessionRefresh,
      Permission.AuthProfileRead,
      Permission.AuthProfileWrite,
      Permission.AuthEmailVerify,
      Permission.AuthProviderLink,
      Permission.AuthProviderUnlink,
      Permission.OrganizationRead,
      Permission.OrganizationSwitch,
    ],
    inherits: [UserRole.Guest],
  },
  [UserRole.Admin]: {
    role: UserRole.Admin,
    permissions: [
      Permission.AdminAccess,
      Permission.AdminAuditRead,
      Permission.AdminUserManage,
      Permission.AdminOrganizationManage,
      Permission.AdminSecurityManage,
      Permission.AuthSessionRevoke,
      Permission.AuthSessionRevokeAll,
      Permission.OrganizationInvite,
      Permission.OrganizationMemberRead,
      Permission.OrganizationMemberWrite,
      Permission.OrganizationMemberRemove,
      Permission.OrganizationMembershipManage,
      Permission.OrganizationRoleManage,
      Permission.BillingRead,
    ],
    inherits: [UserRole.User],
  },
  [UserRole.SuperAdmin]: {
    role: UserRole.SuperAdmin,
    permissions: [
      Permission.AdminAccess,
      Permission.AdminAuditRead,
      Permission.AdminUserManage,
      Permission.AdminOrganizationManage,
      Permission.AdminSecurityManage,
      Permission.AdminImpersonate,
      Permission.AuthSessionRevoke,
      Permission.AuthSessionRevokeAll,
      Permission.AuthProfileDelete,
      Permission.AuthPasswordChange,
      Permission.OrganizationCreate,
      Permission.OrganizationDelete,
      Permission.OrganizationOwnershipTransfer,
      Permission.BillingRead,
      Permission.BillingWrite,
    ],
    inherits: [UserRole.Admin],
  },
  [OrganizationRole.Owner]: {
    role: OrganizationRole.Owner,
    permissions: [
      Permission.OrganizationRead,
      Permission.OrganizationWrite,
      Permission.OrganizationDelete,
      Permission.OrganizationInvite,
      Permission.OrganizationMemberRead,
      Permission.OrganizationMemberWrite,
      Permission.OrganizationMemberRemove,
      Permission.OrganizationMembershipManage,
      Permission.OrganizationRoleManage,
      Permission.OrganizationOwnershipTransfer,
      Permission.BillingRead,
      Permission.BillingWrite,
    ],
    inherits: [OrganizationRole.Admin],
  },
  [OrganizationRole.Admin]: {
    role: OrganizationRole.Admin,
    permissions: [
      Permission.OrganizationRead,
      Permission.OrganizationWrite,
      Permission.OrganizationInvite,
      Permission.OrganizationMemberRead,
      Permission.OrganizationMemberWrite,
      Permission.OrganizationMemberRemove,
      Permission.OrganizationMembershipManage,
      Permission.OrganizationRoleManage,
      Permission.BillingRead,
    ],
    inherits: [OrganizationRole.Member],
  },
  [OrganizationRole.Member]: {
    role: OrganizationRole.Member,
    permissions: [
      Permission.OrganizationRead,
      Permission.OrganizationSwitch,
    ],
    inherits: [UserRole.Guest],
  },
};

/**
 * Creates a permission service with inheritance-aware role resolution.
 *
 * @returns Permission resolver service.
 *
 * @example
 * ```ts
 * const permissions = createPermissionService();
 * if (permissions.hasPermission(UserRole.Admin, Permission.AdminAccess)) {
 *   // ...
 * }
 * ```
 */
export function createPermissionService(): PermissionService {
  return {
    getPermissions(role) {
      return resolvePermissionsForRole(role);
    },
    getInheritedRoles(role) {
      return resolveRoleHierarchy(role);
    },
    hasPermission(role, permission) {
      return resolvePermissionsForRole(role).includes(permission);
    },
    hasAnyPermission(role, permissions) {
      const resolved = new Set(resolvePermissionsForRole(role));
      return permissions.some((permission) => resolved.has(permission));
    },
    isAtLeast(role, requiredRole) {
      if (role === requiredRole) {
        return true;
      }
      return resolveRoleHierarchy(role).includes(requiredRole);
    },
    resolvePermissions(roles) {
      const permissions = new Set<PermissionType>();
      for (const role of roles) {
        for (const permission of resolvePermissionsForRole(role)) {
          permissions.add(permission);
        }
      }
      return Array.from(permissions);
    },
  };
}

/**
 * Resolves direct and inherited permissions for a role.
 *
 * @param role - Role to resolve.
 * @returns Permission list.
 */
export function resolvePermissionsForRole(
  role: AnyRole,
): readonly PermissionType[] {
  const permissions = new Set<PermissionType>();
  const visit = (current: AnyRole): void => {
    const definition = ROLE_DEFINITIONS[current];
    for (const permission of definition.permissions) {
      permissions.add(permission);
    }
    for (const inherited of definition.inherits) {
      visit(inherited);
    }
  };

  visit(role);
  return Array.from(permissions);
}

/**
 * Resolves a role hierarchy, including inherited roles.
 *
 * @param role - Role to resolve.
 * @returns Hierarchy list.
 */
export function resolveRoleHierarchy(role: AnyRole): readonly AnyRole[] {
  const roles = new Set<AnyRole>();
  const visit = (current: AnyRole): void => {
    const definition = ROLE_DEFINITIONS[current];
    for (const inherited of definition.inherits) {
      if (!roles.has(inherited)) {
        roles.add(inherited);
        visit(inherited);
      }
    }
  };

  visit(role);
  return Array.from(roles);
}

/**
 * Determines whether a role is a platform account role.
 *
 * @param role - Role to inspect.
 * @returns `true` for platform roles.
 */
export function isAccountRole(role: AnyRole): role is UserRoleType {
  return role === UserRole.Guest || role === UserRole.User || role === UserRole.Admin || role === UserRole.SuperAdmin;
}

/**
 * Determines whether a role is an organization role.
 *
 * @param role - Role to inspect.
 * @returns `true` for organization roles.
 */
export function isOrganizationRole(
  role: AnyRole,
): role is OrganizationRoleType {
  return role === OrganizationRole.Owner || role === OrganizationRole.Admin || role === OrganizationRole.Member;
}

