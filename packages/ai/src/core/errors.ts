export type AIErrorCode =
  | "AI_PROVIDER_FAILED"
  | "AI_VALIDATION_FAILED"
  | "AI_RATE_LIMITED"
  | "AI_QUOTA_EXCEEDED"
  | "AI_TIMEOUT"
  | "AI_INTERNAL_ERROR";

export type AIErrorDetails = Readonly<Record<string, unknown>> | null;

export abstract class AIError extends Error {
  abstract readonly code: AIErrorCode;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly details?: AIErrorDetails
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

export class AIProviderError extends AIError {
  readonly code = "AI_PROVIDER_FAILED";
  readonly statusCode = 502;
}

export class AIValidationError extends AIError {
  readonly code = "AI_VALIDATION_FAILED";
  readonly statusCode = 400;
}

export class AIRateLimitError extends AIError {
  readonly code = "AI_RATE_LIMITED";
  readonly statusCode = 429;
}

export class AIQuotaExceededError extends AIError {
  readonly code = "AI_QUOTA_EXCEEDED";
  readonly statusCode = 402;
}

export class AITimeoutError extends AIError {
  readonly code = "AI_TIMEOUT";
  readonly statusCode = 504;
}

export function isAIError(error: unknown): error is AIError {
  return error instanceof AIError;
}

export function serializeAIError(error: unknown) {
  if (isAIError(error)) {
    return error.serialize();
  }
  return {
    success: false as const,
    error: {
      code: "AI_INTERNAL_ERROR" as const,
      message: error instanceof Error ? error.message : String(error),
      details: null,
    },
  };
}
