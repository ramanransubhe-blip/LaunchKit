import { ErrorCode } from "./codes.js";

// Base Application Error Class
export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details: any;

  constructor(message: string, code: ErrorCode, statusCode = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details || null;
    Error.captureStackTrace(this, this.constructor);
  }

  // Serialize error object to structured JSON response
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// Subclasses representing specific domain errors
export class ValidationError extends ApplicationError {
  constructor(message = "Validation failed", details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message = "Authentication required") {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401);
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message = "Unauthorized access permission denied") {
    super(message, ErrorCode.AUTHORIZATION_ERROR, 403);
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message = "Database execution failed", details?: any) {
    super(message, ErrorCode.DATABASE_ERROR, 500, details);
  }
}

export class PaymentError extends ApplicationError {
  constructor(message = "Payment transaction failed", details?: any) {
    super(message, ErrorCode.PAYMENT_ERROR, 402, details);
  }
}

export class EmailError extends ApplicationError {
  constructor(message = "Failed to dispatch email", details?: any) {
    super(message, ErrorCode.EMAIL_ERROR, 500, details);
  }
}

export class AIError extends ApplicationError {
  constructor(message = "AI model execution error", details?: any) {
    super(message, ErrorCode.AI_ERROR, 502, details);
  }
}

export class StorageError extends ApplicationError {
  constructor(message = "Cloud storage action failed", details?: any) {
    super(message, ErrorCode.STORAGE_ERROR, 500, details);
  }
}

export class APIError extends ApplicationError {
  constructor(message = "API endpoint error", statusCode = 500, details?: any) {
    super(message, ErrorCode.API_ERROR, statusCode, details);
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message = "Too many requests. Please try again later.", details?: any) {
    super(message, ErrorCode.RATE_LIMIT_ERROR, 429, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = "Resource not found") {
    super(message, ErrorCode.NOT_FOUND_ERROR, 404);
  }
}

export class UnknownError extends ApplicationError {
  constructor(message = "An unknown error occurred", details?: any) {
    super(message, ErrorCode.UNKNOWN_ERROR, 500, details);
  }
}

// Global error helper serialization
export function serializeError(err: Error | unknown) {
  if (err instanceof ApplicationError) {
    return err.toJSON();
  }

  const message = err instanceof Error ? err.message : String(err);
  return {
    success: false,
    error: {
      code: ErrorCode.UNKNOWN_ERROR,
      message,
      details: null,
    },
  };
}

export * from "./codes.js";
