export type CommunicationErrorCode =
  | "COMMUNICATION_PROVIDER_FAILED"
  | "COMMUNICATION_VALIDATION_FAILED"
  | "COMMUNICATION_DELIVERY_FAILED"
  | "COMMUNICATION_TEMPLATE_MISSING"
  | "COMMUNICATION_INTERNAL_ERROR";

export type CommunicationErrorDetails = Readonly<Record<string, unknown>> | null;

export abstract class CommunicationError extends Error {
  abstract readonly code: CommunicationErrorCode;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly details?: CommunicationErrorDetails) {
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

export class CommunicationProviderError extends CommunicationError {
  readonly code = "COMMUNICATION_PROVIDER_FAILED";
  readonly statusCode = 502;
}

export class CommunicationValidationError extends CommunicationError {
  readonly code = "COMMUNICATION_VALIDATION_FAILED";
  readonly statusCode = 400;
}

export class CommunicationDeliveryError extends CommunicationError {
  readonly code = "COMMUNICATION_DELIVERY_FAILED";
  readonly statusCode = 500;
}

export class CommunicationTemplateMissingError extends CommunicationError {
  readonly code = "COMMUNICATION_TEMPLATE_MISSING";
  readonly statusCode = 404;
}

export function isCommunicationError(error: unknown): error is CommunicationError {
  return error instanceof CommunicationError;
}

export function serializeCommunicationError(error: unknown) {
  if (isCommunicationError(error)) {
    return error.serialize();
  }
  return {
    success: false as const,
    error: {
      code: "COMMUNICATION_INTERNAL_ERROR" as const,
      message: error instanceof Error ? error.message : String(error),
      details: null,
    },
  };
}
