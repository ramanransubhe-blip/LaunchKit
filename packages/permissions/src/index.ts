export interface Role {
  name: string;
  inherits?: string[];
  permissions: string[];
}

export class PermissionsManager {
  private roles = new Map<string, Role>();

  constructor() {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles() {
    // 1. Guest role
    this.registerRole({
      name: "guest",
      permissions: ["read:settings", "read:billing"],
    });

    // 2. Member inherits from guest
    this.registerRole({
      name: "member",
      inherits: ["guest"],
      permissions: ["write:settings"],
    });

    // 3. Admin inherits from member
    this.registerRole({
      name: "admin",
      inherits: ["member"],
      permissions: ["write:billing", "manage:users", "manage:teams"],
    });

    // 4. Owner inherits from admin, having absolute privileges
    this.registerRole({
      name: "owner",
      inherits: ["admin"],
      permissions: ["delete:organization", "all"],
    });
  }

  // Register a custom role definition
  registerRole(role: Role): void {
    this.roles.set(role.name, role);
  }

  // Recursively fetch all permissions representing a role including its inherits hierarchy
  getRolePermissions(roleName: string, visited = new Set<string>()): Set<string> {
    const permissions = new Set<string>();

    if (visited.has(roleName)) return permissions; // Prevent infinite circular loops
    visited.add(roleName);

    const role = this.roles.get(roleName);
    if (!role) return permissions;

    // Add direct permissions
    for (const p of role.permissions) {
      permissions.add(p);
    }

    // Add inherited permissions
    if (role.inherits) {
      for (const parent of role.inherits) {
        const parentPermissions = this.getRolePermissions(parent, visited);
        for (const p of parentPermissions) {
          permissions.add(p);
        }
      }
    }

    return permissions;
  }

  // Check if role possesses permission
  hasPermission(roleName: string, permission: string): boolean {
    const permissions = this.getRolePermissions(roleName);
    if (permissions.has("all")) {
      return true;
    }
    return permissions.has(permission);
  }

  // Check if user has permission to modify resource
  hasResourcePermission(
    roleName: string,
    resource: string,
    action: "create" | "read" | "update" | "delete"
  ): boolean {
    const permissions = this.getRolePermissions(roleName);
    if (permissions.has("all")) return true;

    const specificPermission = `${action}:${resource}`;
    const generalPermission = `*:${resource}`;
    const writePermission = `write:${resource}`;

    return (
      permissions.has(specificPermission) ||
      permissions.has(generalPermission) ||
      (action !== "read" && permissions.has(writePermission))
    );
  }
}

export const permissions = new PermissionsManager();
export default permissions;
