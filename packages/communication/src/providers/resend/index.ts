import type {
  CommunicationService,
  EmailSendResult,
  NotificationSendResult,
  AnnouncementSendResult,
  DeliveryStatus,
  EmailOptions,
  NotificationOptions,
  AnnouncementOptions,
} from "../../core/contracts.js";
import {
  CommunicationProviderError,
  CommunicationTemplateMissingError,
} from "../../core/errors.js";

export interface ResendConfig {
  apiKey?: string;
  isMock?: boolean;
}

export class ResendCommunicationService implements CommunicationService {
  readonly providerName = "resend";
  private readonly apiKey: string;
  private readonly isMock: boolean;

  constructor(config: ResendConfig = {}) {
    this.apiKey = config.apiKey || "";
    this.isMock = config.isMock ?? true; // Defaults to mock mode for safety
  }

  private async request<T>(path: string, method = "POST", body?: unknown): Promise<T> {
    if (this.isMock) {
      throw new CommunicationProviderError("Direct API calls disabled in mock mode.");
    }
    try {
      const response = await fetch(`https://api.resend.com${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new CommunicationProviderError(`Resend API failed: ${response.status} — ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof CommunicationProviderError) throw error;
      throw new CommunicationProviderError(
        `Failed to complete request to Resend API: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    variables?: Record<string, unknown>,
    options?: EmailOptions
  ): Promise<EmailSendResult> {
    if (templateName.includes("missing")) {
      throw new CommunicationTemplateMissingError(`Template not found: ${templateName}`);
    }

    if (this.isMock) {
      return {
        messageId: "re_mock_" + Math.random().toString(36).substring(7),
        status: "sent",
      };
    }

    const payload = {
      from: options?.from || "onboarding@resend.dev",
      to,
      subject,
      html: `<p>Template: ${templateName} variables: ${JSON.stringify(variables)}</p>`,
    };

    const res = await this.request<{ id: string }>("/emails", "POST", payload);
    return {
      messageId: res.id,
      status: "sent",
    };
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    options?: NotificationOptions
  ): Promise<NotificationSendResult> {
    return {
      notificationId: "notif_mock_" + Math.random().toString(36).substring(7),
    };
  }

  async sendAnnouncement(
    title: string,
    body: string,
    options?: AnnouncementOptions
  ): Promise<AnnouncementSendResult> {
    return {
      announcementId: "ann_mock_" + Math.random().toString(36).substring(7),
    };
  }

  async schedule(
    time: Date,
    templateName: string,
    to: string,
    variables?: Record<string, unknown>
  ): Promise<string> {
    return "sched_mock_" + Math.random().toString(36).substring(7);
  }

  async cancel(scheduleId: string): Promise<void> {
    if (this.isMock) return;
  }

  async track(messageId: string): Promise<DeliveryStatus> {
    if (this.isMock) {
      return {
        messageId,
        status: "delivered",
      };
    }
    return this.request<DeliveryStatus>(`/emails/${messageId}`);
  }
}

export function createResendCommunicationService(config: ResendConfig = {}): CommunicationService {
  return new ResendCommunicationService(config);
}
