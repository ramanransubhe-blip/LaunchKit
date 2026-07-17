"use server";

import { serializeError } from "@devlaunchkit/errors";
import { apiKeySchema, logsQuerySchema } from "../validators/index.js";

export interface ApiActionResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

async function handleActionError<T>(error: unknown): Promise<ApiActionResponse<T>> {
  const serialized = serializeError(error);
  return {
    success: false,
    data: null,
    error: {
      code: "API_ACTION_FAILED",
      message: error instanceof Error ? error.message : String(error),
      details: serialized,
    },
  };
}

export async function createApiKeyAction(
  rawInput: unknown
): Promise<ApiActionResponse<{ key: string }>> {
  try {
    const input = apiKeySchema.parse(rawInput);
    // Simulate generation of key
    const key = `lk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    return {
      success: true,
      data: { key },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function queryRequestLogsAction(
  rawInput: unknown
): Promise<ApiActionResponse<readonly any[]>> {
  try {
    const input = logsQuerySchema.parse(rawInput);
    const mockLogs = [
      {
        id: "log_1",
        method: "POST",
        path: "/v1/ai/generate",
        status: 200,
        latency: 120,
        timestamp: new Date(),
      },
      {
        id: "log_2",
        method: "GET",
        path: "/v1/billing/invoices",
        status: 200,
        latency: 45,
        timestamp: new Date(),
      },
    ];
    return {
      success: true,
      data: mockLogs.slice(0, input.limit),
    };
  } catch (error) {
    return handleActionError(error);
  }
}
