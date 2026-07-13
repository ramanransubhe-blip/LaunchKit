import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, index, primaryKey } from "drizzle-orm/pg-core";
import { profiles, organizations } from "./core";

// 1. Notifications Table
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").default("info").notNull(), // "info", "success", "warning", "error"
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("notifications_profile_idx").on(t.profileId),
  ]
);

// 2. Notification Preferences Table
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    channel: text("channel").notNull(), // e.g. "email", "in_app", "push"
    enabled: boolean("enabled").default(true).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.profileId, t.channel] }),
    index("notif_pref_profile_idx").on(t.profileId),
  ]
);

// 3. User Feedback Table
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    category: text("category").notNull(), // e.g. "bug", "feature", "general"
    rating: integer("rating").notNull(), // e.g. 1 to 5
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("feedback_profile_idx").on(t.profileId),
  ]
);

// 4. Support Tickets Table
export const supportTickets = pgTable(
  "support_tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    status: text("status").default("open").notNull(), // "open", "pending", "closed"
    priority: text("priority").default("normal").notNull(), // "low", "normal", "high"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("support_tickets_profile_idx").on(t.profileId),
  ]
);

// 5. Security Audit Logs Table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }), // Nullable for system-level actions
    action: text("action").notNull(), // e.g. "auth:login", "org:delete"
    resource: text("resource").notNull(), // e.g. "profile:uuid"
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    payload: jsonb("payload").$type<Record<string, any>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_logs_profile_idx").on(t.profileId),
  ]
);

// 6. Tenant Activity Logs Table
export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("activity_logs_org_idx").on(t.organizationId),
    index("activity_logs_profile_idx").on(t.profileId),
  ]
);

// 7. Feature Flags Table
export const featureFlags = pgTable(
  "feature_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(), // e.g. "beta:ai-chat"
    description: text("description"),
    defaultValue: boolean("default_value").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 8. Feature Flag Assignments (User/Organization overrides)
export const featureFlagAssignments = pgTable(
  "feature_flag_assignments",
  {
    flagId: uuid("flag_id").references(() => featureFlags.id, { onDelete: "cascade" }).notNull(),
    targetType: text("target_type").notNull(), // "user" or "organization"
    targetId: uuid("target_id").notNull(), // Matches profiles.id or organizations.id
    value: boolean("value").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.flagId, t.targetType, t.targetId] }),
    index("flag_assign_target_idx").on(t.targetType, t.targetId),
  ]
);

// 9. Pre-launch Waitlist Table
export const waitlist = pgTable(
  "waitlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    status: text("status").default("pending").notNull(), // "pending", "invited", "joined"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 10. Public Contact Messages
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    message: text("message").notNull(),
    status: text("status").default("unread").notNull(), // "unread", "read", "replied"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 11. Platform Wide Announcements Banners
export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    type: text("type").default("feature").notNull(), // "feature", "maintenance", "info"
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
