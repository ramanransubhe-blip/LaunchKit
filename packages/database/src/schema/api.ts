import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, index, primaryKey } from "drizzle-orm/pg-core";
import { organizations } from "./core";

// 1. API Keys Table
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    keyHash: text("key_hash").notNull().unique(), // Hashed API Key for secure verification
    name: text("name").notNull(),
    scopes: text("scopes").array(), // e.g. ["read:billing", "write:settings"]
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("api_keys_org_idx").on(t.organizationId),
  ]
);

// 2. API Gateway Requests Logger
export const apiRequests = pgTable(
  "api_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiKeyId: uuid("api_key_id").references(() => apiKeys.id, { onDelete: "cascade" }).notNull(),
    path: text("path").notNull(),
    method: text("method").notNull(),
    statusCode: integer("status_code").notNull(),
    responseTimeMs: integer("response_time_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("api_requests_key_idx").on(t.apiKeyId),
  ]
);

// 3. Webhook Logs Table
export const webhookLogs = pgTable(
  "webhook_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(), // e.g. "payment.succeeded"
    payload: jsonb("payload").$type<Record<string, any>>().notNull(),
    status: text("status").notNull(), // "success" or "failed"
    attempt: integer("attempt").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 4. Rate Limits Sliding Window Tracking
export const rateLimits = pgTable(
  "rate_limits",
  {
    targetId: text("target_id").notNull(), // IP address or API Key ID
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").default(0).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.targetId, t.windowStart] }),
    index("rate_limits_target_idx").on(t.targetId),
  ]
);
