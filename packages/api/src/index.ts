export interface ApiResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: any;
  };
  readonly meta?: Record<string, any>;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  readonly meta: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalItems: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

export interface CursorResponse<T = any> extends ApiResponse<T[]> {
  readonly meta: {
    readonly nextCursor: string | null;
    readonly hasMore: boolean;
  };
}

export function sendSuccess<T>(data: T, meta?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function sendFailure(message: string, code = "INTERNAL_ERROR", details?: any): ApiResponse<null> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export function sendValidationError(errors: Record<string, string[]>): ApiResponse<null> {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: errors,
    },
  };
}

export function sendPagination<T>(
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / pageSize);
  const p = Math.max(1, page);

  return {
    success: true,
    data,
    meta: {
      page: p,
      pageSize,
      totalItems,
      totalPages,
      hasNext: p < totalPages,
      hasPrev: p > 1,
    },
  };
}

export function sendCursor<T>(data: T[], nextCursor: string | null, hasMore: boolean): CursorResponse<T> {
  return {
    success: true,
    data,
    meta: {
      nextCursor,
      hasMore,
    },
  };
}

export * from "./sdk/client.js";
export * from "./validators/index.js";
export * from "./server/actions.js";
