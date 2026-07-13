import { pgTable, uuid, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";

// 1. System Settings Table (KV config store)
export const systemSettings = pgTable(
  "system_settings",
  {
    key: text("key").primaryKey(), // Setting key config name
    value: jsonb("value").$type<any>().notNull(),
    description: text("description"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 2. Background Asynchronous Job Queue
export const jobQueue = pgTable(
  "job_queue",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), // Job identifier e.g. "email:send-welcome"
    payload: jsonb("payload").$type<Record<string, any>>(),
    status: text("status").default("pending").notNull(), // "pending", "running", "completed", "failed"
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    runAt: timestamp("run_at", { withTimezone: true }).defaultNow().notNull(), // scheduled runtime
    error: text("error"), // tracks execution stack trace if failed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("job_queue_status_run_idx").on(t.status, t.runAt),
  ]
);

// 3. Periodic Task Execution Logs
export const cronLogs = pgTable(
  "cron_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), // Cron script identifier e.g. "billing:sync-invoice"
    status: text("status").notNull(), // "success" or "failed"
    durationMs: integer("duration_ms").notNull(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 4. Exception logs database collector
export const errorLogs = pgTable(
  "error_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    message: text("message").notNull(),
    stack: text("stack"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
