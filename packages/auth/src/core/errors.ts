import type { AuthErrorCode } from "../types/index.js";

/** Structured details attached to auth errors. */
export type AuthErrorDetails = Readonly<Record<string, unknown>> | null;

/**
 * Base class for all auth-specific errors.
 *
 * @example
 * ```ts
 * throw new AuthValidationError("Email is invalid", { field: "email" });
 * ```
 */
export abstract class AuthError extends Error {
  /** Stable auth error code. */
  abstract readonly code: AuthErrorCode;
  /** HTTP status code associated with the error. */
  abstract readonly statusCode: number;

  /**
   * Creates a typed auth error.
   *
   * @param message - Human-readable message.
   * @param details - Structured error details.
   */
  constructor(message: string, public readonly details?: AuthErrorDetails) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Serializes the error into a JSON-safe object.
   *
   * @returns Serializable auth error payload.
   */
  serialize(): {
    success: false;
    error: {
      code: AuthErrorCode;
      message: string;
      details: AuthErrorDetails;
    };
  } {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details ?? null,
      },
    };
  }
}

/** Thrown when validation of an input payload fails. */
export class AuthValidationError extends AuthError {
  readonly code = "AUTH_VALIDATION_FAILED";
  readonly statusCode = 400;
}

/** Thrown when a user is not authenticated. */
export class AuthUnauthorizedError extends AuthError {
  readonly code = "AUTH_UNAUTHORIZED";
  readonly statusCode = 401;
}

/** Thrown when a user is authenticated but lacks access. */
export class AuthForbiddenError extends AuthError {
  readonly code = "AUTH_FORBIDDEN";
  readonly statusCode = 403;
}

/** Thrown when an entity cannot be found. */
export class AuthNotFoundError extends AuthError {
  readonly code = "AUTH_USER_NOT_FOUND";
  readonly statusCode = 404;
}

/** Thrown when a request conflicts with the current state. */
export class AuthConflictError extends AuthError {
  readonly code = "AUTH_ORGANIZATION_CONFLICT";
  readonly statusCode = 409;
}

/** Thrown when a request is rate limited. */
export class AuthRateLimitError extends AuthError {
  readonly code = "AUTH_RATE_LIMITED";
  readonly statusCode = 429;
}

/** Thrown when a token is invalid or malformed. */
export class AuthInvalidTokenError extends AuthError {
  readonly code = "AUTH_INVALID_TOKEN";
  readonly statusCode = 400;
}

/** Thrown when a token or session has expired. */
export class AuthExpiredTokenError extends AuthError {
  readonly code = "AUTH_EXPIRED_TOKEN";
  readonly statusCode = 401;
}

/** Thrown when a provider operation fails. */
export class AuthProviderError extends AuthError {
  readonly code = "AUTH_PROVIDER_ERROR";
  readonly statusCode = 502;
}

/** Thrown when a password does not satisfy the current policy. */
export class AuthWeakPasswordError extends AuthError {
  readonly code = "AUTH_WEAK_PASSWORD";
  readonly statusCode = 422;
}

/** Thrown when account security rules block the request. */
export class AuthSecurityError extends AuthError {
  readonly code = "AUTH_ACCOUNT_LOCKED";
  readonly statusCode = 423;
}

/**
 * Narrows unknown failures to `AuthError`.
 *
 * @param error - Value to inspect.
 * @returns `true` when the value is an `AuthError`.
 *
 * @example
 * ```ts
 * if (isAuthError(error)) {
 *   console.log(error.code);
 * }
 * ```
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Converts an unknown error into a typed auth error.
 *
 * @param error - The thrown value.
 * @param fallback - Optional fallback error code.
 * @returns A typed auth error instance.
 *
 * @example
 * ```ts
 * const authError = toAuthError(error, "AUTH_PROVIDER_ERROR");
 * ```
 */
export function toAuthError(
  error: unknown,
  fallback: AuthErrorCode = "AUTH_INTERNAL_ERROR",
): AuthError {
  if (isAuthError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  return new AuthProviderError(message, {
    fallbackCode: fallback,
  });
}

/**
 * Serializes a typed auth error or returns a generic internal error payload.
 *
 * @param error - Error instance to serialize.
 * @returns JSON-safe error payload.
 *
 * @example
 * ```ts
 * return Response.json(serializeAuthError(error), { status: 400 });
 * ```
 */
export function serializeAuthError(error: unknown): {
  success: false;
  error: {
    code: AuthErrorCode;
    message: string;
    details: AuthErrorDetails;
  };
} {
  if (isAuthError(error)) {
    return error.serialize();
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    success: false,
    error: {
      code: "AUTH_INTERNAL_ERROR",
      message,
      details: null,
    },
  };
}
