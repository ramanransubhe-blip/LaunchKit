import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { organizations, profiles } from "./core";

// 1. Folders Table (Tree structure)
export const folders = pgTable(
  "folders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    parentId: uuid("parent_id"), // Reference to self, nullable for root folder
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("folders_org_idx").on(t.organizationId), index("folders_parent_idx").on(t.parentId)]
);

// Self-reference relationship declaration is handled in relations file

// 2. Files Table
export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    folderId: uuid("folder_id").references(() => folders.id, { onDelete: "cascade" }), // Nullable for files in root
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    key: text("key").notNull(), // S3/Cloud Storage storage key path
    size: integer("size").notNull(), // In bytes
    mimeType: text("mime_type").notNull(), // e.g. "image/png", "application/pdf"
    url: text("url").notNull(), // Public URL
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("files_folder_idx").on(t.folderId), index("files_org_idx").on(t.organizationId)]
);

// 3. Uploads Session Tracking Table
export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    status: text("status").default("pending").notNull(), // "pending", "completed", "failed"
    size: integer("size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("uploads_profile_idx").on(t.profileId)]
);

// 4. Media Metadata Table (Specific dimension details for files)
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileId: uuid("file_id")
      .references(() => files.id, { onDelete: "cascade" })
      .notNull(),
    width: integer("width"), // Image/video pixels width
    height: integer("height"), // Image/video pixels height
    duration: integer("duration"), // Video/Audio length in seconds
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("media_file_idx").on(t.fileId)]
);
