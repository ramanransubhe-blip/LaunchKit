export type StorageErrorCode =
  | "STORAGE_PROVIDER_FAILED"
  | "STORAGE_VALIDATION_FAILED"
  | "STORAGE_PERMISSION_DENIED"
  | "STORAGE_QUOTA_EXCEEDED"
  | "STORAGE_FILE_NOT_FOUND"
  | "STORAGE_EXPIRED_URL"
  | "STORAGE_INTERNAL_ERROR";

export type StorageErrorDetails = Readonly<Record<string, unknown>> | null;

export abstract class StorageError extends Error {
  abstract readonly code: StorageErrorCode;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly details?: StorageErrorDetails
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  serialize() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.message,
        details: this.details ?? null,
      },
    };
  }
}

export class StorageProviderError extends StorageError {
  readonly code = "STORAGE_PROVIDER_FAILED";
  readonly statusCode = 502;
}

export class StorageValidationError extends StorageError {
  readonly code = "STORAGE_VALIDATION_FAILED";
  readonly statusCode = 400;
}

export class StoragePermissionDeniedError extends StorageError {
  readonly code = "STORAGE_PERMISSION_DENIED";
  readonly statusCode = 403;
}

export class StorageQuotaExceededError extends StorageError {
  readonly code = "STORAGE_QUOTA_EXCEEDED";
  readonly statusCode = 402;
}

export class StorageFileNotFoundError extends StorageError {
  readonly code = "STORAGE_FILE_NOT_FOUND";
  readonly statusCode = 404;
}

export class StorageExpiredUrlError extends StorageError {
  readonly code = "STORAGE_EXPIRED_URL";
  readonly statusCode = 410;
}

export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

export function serializeStorageError(error: unknown) {
  if (isStorageError(error)) {
    return error.serialize();
  }
  return {
    success: false as const,
    error: {
      code: "STORAGE_INTERNAL_ERROR" as const,
      message: error instanceof Error ? error.message : String(error),
      details: null,
    },
  };
}
