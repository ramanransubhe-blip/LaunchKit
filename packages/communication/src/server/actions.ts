"use server";

import { getGlobalCommunicationService } from "../core/factory.js";
import { serializeCommunicationError } from "../core/errors.js";
import {
  sendEmailSchema,
  sendNotificationSchema,
  sendAnnouncementSchema,
  scheduleEmailSchema,
} from "../validators/index.js";
import type {
  EmailSendResult,
  NotificationSendResult,
  AnnouncementSendResult,
} from "../core/contracts.js";

export interface CommunicationActionResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

async function handleActionError<T>(error: unknown): Promise<CommunicationActionResponse<T>> {
  const serialized = serializeCommunicationError(error);
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

export async function sendEmailAction(
  rawInput: unknown
): Promise<CommunicationActionResponse<EmailSendResult>> {
  try {
    const input = sendEmailSchema.parse(rawInput);
    const service = getGlobalCommunicationService();
    const result = await service.sendEmail(
      input.to,
      input.subject,
      input.templateName,
      input.variables
    );
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function sendNotificationAction(
  rawInput: unknown
): Promise<CommunicationActionResponse<NotificationSendResult>> {
  try {
    const input = sendNotificationSchema.parse(rawInput);
    const service = getGlobalCommunicationService();
    const result = await service.sendNotification(input.userId, input.title, input.body, {
      priority: input.priority,
      category: input.category,
    });
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function sendAnnouncementAction(
  rawInput: unknown
): Promise<CommunicationActionResponse<AnnouncementSendResult>> {
  try {
    const input = sendAnnouncementSchema.parse(rawInput);
    const service = getGlobalCommunicationService();
    const result = await service.sendAnnouncement(input.title, input.body, {
      organizationId: input.organizationId,
      isDismissible: input.isDismissible,
    });
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function scheduleEmailAction(
  rawInput: unknown
): Promise<CommunicationActionResponse<string>> {
  try {
    const input = scheduleEmailSchema.parse(rawInput);
    const service = getGlobalCommunicationService();
    const result = await service.schedule(
      input.time,
      input.templateName,
      input.to,
      input.variables
    );
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
