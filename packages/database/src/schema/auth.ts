import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { profiles } from "./core";

// 1. Sessions Table
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("sessions_profile_idx").on(t.profileId),
  ]
);

// 2. Devices Table
export const devices = pgTable(
  "devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    lastActive: timestamp("last_active", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("devices_profile_idx").on(t.profileId),
  ]
);

// 3. Login History Table
export const loginHistory = pgTable(
  "login_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }), // nullable for failed logins with non-existing users
    email: text("email").notNull(), // tracks email used in login request
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    status: text("status").notNull(), // e.g. "success", "failed"
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("login_history_profile_idx").on(t.profileId),
  ]
);

// 4. Verification Tokens Table
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    type: text("type").notNull(), // e.g. "email_verification", "password_reset", "mfa_verification"
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 5. Magic Links Table
export const magicLinks = pgTable(
  "magic_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 6. OAuth Accounts Table
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
    provider: text("provider").notNull(), // e.g. "github", "google"
    providerUserId: text("provider_user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("oauth_accounts_profile_idx").on(t.profileId),
  ]
);
