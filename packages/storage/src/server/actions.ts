"use server";

import { getGlobalStorageService } from "../core/factory.js";
import { serializeStorageError } from "../core/errors.js";
import {
  uploadSchema,
  deleteSchema,
  moveSchema,
  createFolderSchema,
  shareSchema,
} from "../validators/index.js";
import type { StorageUploadResult } from "../core/contracts.js";

export interface StorageActionResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

async function handleActionError<T>(error: unknown): Promise<StorageActionResponse<T>> {
  const serialized = serializeStorageError(error);
  return {
    success: false,
    data: null,
    error: {
      code: serialized.error.code,
      message: serialized.error.message,
      details: serialized.error.details,
    },
  };
}

export async function uploadFileAction(
  rawInput: unknown,
  contentBase64: string
): Promise<StorageActionResponse<StorageUploadResult>> {
  try {
    const input = uploadSchema.parse(rawInput);
    const service = getGlobalStorageService();
    const buffer = Buffer.from(contentBase64, "base64");
    const result = await service.upload(input.bucket, input.path, buffer, {
      contentType: input.contentType,
      isPublic: input.isPublic,
    });
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteFileAction(rawInput: unknown): Promise<StorageActionResponse<void>> {
  try {
    const input = deleteSchema.parse(rawInput);
    const service = getGlobalStorageService();
    await service.delete(input.bucket, input.path);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function moveFileAction(rawInput: unknown): Promise<StorageActionResponse<void>> {
  try {
    const input = moveSchema.parse(rawInput);
    const service = getGlobalStorageService();
    await service.move(input.bucket, input.fromPath, input.toPath);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createFolderAction(rawInput: unknown): Promise<StorageActionResponse<void>> {
  try {
    const input = createFolderSchema.parse(rawInput);
    const service = getGlobalStorageService();
    await service.createFolder(input.bucket, input.path);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function shareFileAction(rawInput: unknown): Promise<StorageActionResponse<void>> {
  try {
    const input = shareSchema.parse(rawInput);
    const service = getGlobalStorageService();
    await service.share(input.bucket, input.path, input.access);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
