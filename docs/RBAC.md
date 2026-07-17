# Role-Based Access Control (RBAC) System

DevLaunchKit includes a centralized, hierarchical Role-Based Access Control (RBAC) matrix that maps platform and organization roles to granular permissions.

---

## Role Inheritance Engine

The permission service resolves permissions by recursively visiting inherited roles:

```typescript
import { createPermissionService, UserRole, Permission } from "@devlaunchkit/auth";

const permissions = createPermissionService();

// Checks permissions granted directly or inherited from parent roles
const hasAccess = permissions.hasPermission(UserRole.Admin, Permission.AdminAccess); // true
const guestAccess = permissions.hasPermission(UserRole.Guest, Permission.AdminAccess); // false
```

---

## Centralized Role Hierarchy Table

| Role          | Directly Granted Permissions                                   | Inherits From |
| :------------ | :------------------------------------------------------------- | :------------ |
| `guest`       | `auth.sign_in`, `auth.sign_up`, `auth.password_forgot`         | (None)        |
| `user`        | `auth.profile_read`, `auth.profile_write`, `organization.read` | `guest`       |
| `admin`       | `admin.access`, `admin.user_manage`, `organization.invite`     | `user`        |
| `super_admin` | `admin.impersonate`, `organization.delete`, `billing.write`    | `admin`       |

---

## Server Role Protection

Secure endpoint routes by requiring specific minimum role thresholds:

```typescript
import { createAuthServerHelpers } from "@devlaunchkit/auth/server";
import { UserRole } from "@devlaunchkit/auth";

export async function GET() {
  const auth = createAuthServerHelpers({ store });

  // Throws AuthForbiddenError if the user is not Admin or SuperAdmin
  auth.requireRole(UserRole.Admin);

  return Response.json({ success: true });
}
```
