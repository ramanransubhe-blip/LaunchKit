import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  numeric,
} from "drizzle-orm/pg-core";
import { profiles } from "./core";

// 1. AI Models Catalog
export const aiModels = pgTable("ai_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull(), // e.g. "google", "openai", "anthropic"
  name: text("name").notNull().unique(), // e.g. "gemini-1.5-pro", "gpt-4o"
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. AI Conversations Table
export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("ai_conv_profile_idx").on(t.profileId)]
);

// 3. AI Messages Table
export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => aiConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(), // e.g. "user", "assistant", "system"
    content: text("content").notNull(),
    thinking: text("thinking"), // Logs the AI reasoning process
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("ai_msg_conv_idx").on(t.conversationId)]
);

// 4. Prompt Templates Catalog
export const promptTemplates = pgTable("prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Tool Calls (Logs executing agent actions)
export const toolCalls = pgTable(
  "tool_calls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .references(() => aiMessages.id, { onDelete: "cascade" })
      .notNull(),
    toolName: text("tool_name").notNull(),
    arguments: jsonb("arguments").$type<Record<string, any>>().notNull(),
    result: jsonb("result").$type<Record<string, any>>(),
    status: text("status").default("running").notNull(), // e.g. "running", "success", "error"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("tool_calls_message_idx").on(t.messageId)]
);

// 6. Token Usage Logs
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    modelId: uuid("model_id")
      .references(() => aiModels.id, { onDelete: "restrict" })
      .notNull(),
    promptTokens: integer("prompt_tokens").default(0).notNull(),
    completionTokens: integer("completion_tokens").default(0).notNull(),
    totalTokens: integer("total_tokens").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("ai_usage_profile_idx").on(t.profileId)]
);

// 7. Cost & Conversation usage summaries
export const modelUsage = pgTable(
  "model_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => aiConversations.id, { onDelete: "cascade" })
      .notNull(),
    tokensUsed: integer("tokens_used").default(0).notNull(),
    cost: numeric("cost", { precision: 10, scale: 6 }).default("0.000000").notNull(), // Exact pricing decimals
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("model_usage_conv_idx").on(t.conversationId)]
);
