export type BillingErrorCode =
  | "BILLING_PROVIDER_FAILED"
  | "BILLING_VALIDATION_FAILED"
  | "BILLING_WEBHOOK_VERIFICATION_FAILED"
  | "BILLING_INSUFFICIENT_CREDITS"
  | "BILLING_SUBSCRIPTION_EXPIRED"
  | "BILLING_PLAN_NOT_FOUND"
  | "BILLING_INTERNAL_ERROR";

export type BillingErrorDetails = Readonly<Record<string, unknown>> | null;

export abstract class BillingError extends Error {
  abstract readonly code: BillingErrorCode;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly details?: BillingErrorDetails
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

export class BillingProviderError extends BillingError {
  readonly code = "BILLING_PROVIDER_FAILED";
  readonly statusCode = 502;
}

export class BillingValidationError extends BillingError {
  readonly code = "BILLING_VALIDATION_FAILED";
  readonly statusCode = 400;
}

export class BillingWebhookError extends BillingError {
  readonly code = "BILLING_WEBHOOK_VERIFICATION_FAILED";
  readonly statusCode = 401;
}

export class BillingInsufficientCreditsError extends BillingError {
  readonly code = "BILLING_INSUFFICIENT_CREDITS";
  readonly statusCode = 402;
}

export class BillingPlanNotFoundError extends BillingError {
  readonly code = "BILLING_PLAN_NOT_FOUND";
  readonly statusCode = 404;
}

export function isBillingError(error: unknown): error is BillingError {
  return error instanceof BillingError;
}

export function serializeBillingError(error: unknown) {
  if (isBillingError(error)) {
    return error.serialize();
  }
  return {
    success: false as const,
    error: {
      code: "BILLING_INTERNAL_ERROR" as const,
      message: error instanceof Error ? error.message : String(error),
      details: null,
    },
  };
}
