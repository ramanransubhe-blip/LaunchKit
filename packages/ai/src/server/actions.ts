"use server";

import { getGlobalAIService } from "../core/factory.js";
import { serializeAIError } from "../core/errors.js";
import {
  generateTextSchema,
  chatSchema,
  summarizeSchema,
  classifySchema,
  moderateSchema,
} from "../validators/index.js";
import type {
  AITextResult,
  AIChatResult,
  AIClassifyResult,
  AIModerationResult,
} from "../core/contracts.js";

export interface AIActionResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

async function handleActionError<T>(error: unknown): Promise<AIActionResponse<T>> {
  const serialized = serializeAIError(error);
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

export async function generateTextAction(
  rawInput: unknown
): Promise<AIActionResponse<AITextResult>> {
  try {
    const input = generateTextSchema.parse(rawInput);
    const service = getGlobalAIService();
    const result = await service.generateText(input.prompt, input.options);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function chatAction(rawInput: unknown): Promise<AIActionResponse<AIChatResult>> {
  try {
    const input = chatSchema.parse(rawInput);
    const service = getGlobalAIService();
    const result = await service.chat(input.messages, input.options);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function summarizeAction(rawInput: unknown): Promise<AIActionResponse<AITextResult>> {
  try {
    const input = summarizeSchema.parse(rawInput);
    const service = getGlobalAIService();
    const result = await service.summarize(input.text, input.options);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function classifyAction(
  rawInput: unknown
): Promise<AIActionResponse<AIClassifyResult>> {
  try {
    const input = classifySchema.parse(rawInput);
    const service = getGlobalAIService();
    const result = await service.classify(input.text, input.categories, input.options);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function moderateAction(
  rawInput: unknown
): Promise<AIActionResponse<AIModerationResult>> {
  try {
    const input = moderateSchema.parse(rawInput);
    const service = getGlobalAIService();
    const result = await service.moderate(input.text, input.options);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
