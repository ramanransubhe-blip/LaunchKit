import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

// 1. Roles Table
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // e.g. "admin", "member", "guest", "owner"
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Permissions Table
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // e.g. "read:billing", "write:settings"
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Role-Permissions Many-to-Many Bridge
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    permissionId: uuid("permission_id")
      .references(() => permissions.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    index("role_permissions_role_idx").on(t.roleId),
    index("role_permissions_permission_idx").on(t.permissionId),
  ]
);

// 4. Profiles Table
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    role: text("role").default("user").notNull(),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft deletes support
  },
  (t) => [uniqueIndex("profiles_email_idx").on(t.email)]
);

// 5. User-Roles Many-to-Many Bridge (Platform-wide RBAC Roles)
export const userRoles = pgTable(
  "user_roles",
  {
    profileId: uuid("profile_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    index("user_roles_profile_idx").on(t.profileId),
    index("user_roles_role_idx").on(t.roleId),
  ]
);

// 6. Organizations Table (Multi-tenant isolating tenant boundary)
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("organizations_slug_idx").on(t.slug)]
);

// 7. Organization Members (Tenant Membership Mapping with Role)
export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    profileId: uuid("profile_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "restrict" })
      .notNull(), // Restrict deleting roles in use
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("org_members_org_idx").on(t.organizationId),
    index("org_members_profile_idx").on(t.profileId),
  ]
);

// 8. Teams Table (Project workspaces inside an organization)
export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("teams_org_idx").on(t.organizationId),
    uniqueIndex("teams_org_slug_idx").on(t.organizationId, t.slug),
  ]
);

// 9. Team Members Many-to-Many Bridge
export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    profileId: uuid("profile_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("team_members_team_idx").on(t.teamId),
    index("team_members_profile_idx").on(t.profileId),
  ]
);
