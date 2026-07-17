import { z } from "zod";

export const uploadSchema = z.object({
  bucket: z.string().min(1, "Bucket name is required"),
  path: z.string().min(1, "File path is required"),
  contentType: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const deleteSchema = z.object({
  bucket: z.string().min(1, "Bucket name is required"),
  path: z.string().min(1, "File path is required"),
});

export const moveSchema = z.object({
  bucket: z.string().min(1, "Bucket name is required"),
  fromPath: z.string().min(1, "Source file path is required"),
  toPath: z.string().min(1, "Destination file path is required"),
});

export const createFolderSchema = z.object({
  bucket: z.string().min(1, "Bucket name is required"),
  path: z.string().min(1, "Folder path is required"),
});

export const shareSchema = z.object({
  bucket: z.string().min(1, "Bucket name is required"),
  path: z.string().min(1, "File path is required"),
  access: z.enum(["public", "private", "org"]),
});

export function validatePayload<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Storage validation failed: ${result.error.errors.map((e) => e.message).join(", ")}`
    );
  }
  return result.data;
}

export type UploadInput = z.infer<typeof uploadSchema>;
export type DeleteInput = z.infer<typeof deleteSchema>;
export type MoveInput = z.infer<typeof moveSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
