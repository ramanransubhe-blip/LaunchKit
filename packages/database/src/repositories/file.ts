import { BaseRepository } from "./base";
import { File, InsertFile } from "../types";
import { files, folders, media } from "../schema";
import { eq, and } from "drizzle-orm";

export class FileRepository extends BaseRepository<File, InsertFile, typeof files> {
  constructor() {
    super(files);
  }

  // Create folder directory
  async createFolder(organizationId: string, name: string, parentId?: string): Promise<any> {
    const results = await this.db
      .insert(folders)
      .values({
        organizationId,
        name,
        parentId,
      })
      .returning();
    return results[0];
  }

  // Find sub-folders within directory
  async getSubfolders(organizationId: string, parentId?: string): Promise<any[]> {
    return await this.db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.organizationId, organizationId),
          parentId ? eq(folders.parentId, parentId) : sql`${folders.parentId} IS NULL`
        )
      );
  }

  // Get files within directory
  async getFiles(organizationId: string, folderId?: string): Promise<File[]> {
    return await this.db
      .select()
      .from(files)
      .where(
        and(
          eq(files.organizationId, organizationId),
          folderId ? eq(files.folderId, folderId) : sql`${files.folderId} IS NULL`
        )
      );
  }

  // Save specific media dimensions
  async saveMediaMeta(data: {
    fileId: string;
    width?: number;
    height?: number;
    duration?: number;
  }): Promise<void> {
    await this.db.insert(media).values(data);
  }
}
// Helper sql import
import { sql } from "drizzle-orm";
