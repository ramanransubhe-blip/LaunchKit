import test from "node:test";
import assert from "node:assert/strict";
import {
  createPermissionService,
  isAccountRole,
  isOrganizationRole,
  resolvePermissionsForRole,
  resolveRoleHierarchy,
} from "../src/permissions/index.js";
import { OrganizationRole, Permission, UserRole } from "../src/index.js";

test("permission service resolves inherited permissions", () => {
  const permissions = createPermissionService();
  assert.equal(permissions.hasPermission(UserRole.Admin, Permission.AdminAccess), true);
  assert.equal(permissions.hasPermission(OrganizationRole.Owner, Permission.BillingWrite), true);
  assert.equal(permissions.hasPermission(UserRole.Guest, Permission.OrganizationRead), false);
});

test("role hierarchy is computed deterministically", () => {
  assert.deepEqual(resolveRoleHierarchy(UserRole.SuperAdmin), [
    UserRole.Admin,
    UserRole.User,
    UserRole.Guest,
  ]);
  assert.deepEqual(
    resolvePermissionsForRole(OrganizationRole.Member).includes(Permission.OrganizationRead),
    true
  );
});

test("role helpers classify platform and organization roles", () => {
  assert.equal(isAccountRole(UserRole.Admin), true);
  assert.equal(isAccountRole(OrganizationRole.Admin), false);
  assert.equal(isOrganizationRole(OrganizationRole.Owner), true);
  assert.equal(isOrganizationRole(UserRole.User), false);
});
