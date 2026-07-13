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
import { CommunicationProviderError } from "../../core/errors.js";

export interface PostmarkConfig {
  apiKey?: string;
  isMock?: boolean;
}

export class PostmarkCommunicationService implements CommunicationService {
  readonly providerName = "postmark";
  private readonly apiKey: string;
  private readonly isMock: boolean;

  constructor(config: PostmarkConfig = {}) {
    this.apiKey = config.apiKey || "";
    this.isMock = config.isMock ?? true;
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    variables?: Record<string, unknown>,
    options?: EmailOptions
  ): Promise<EmailSendResult> {
    if (this.isMock) {
      return {
        messageId: "pm_mock_" + Math.random().toString(36).substring(7),
        status: "sent",
      };
    }
    throw new CommunicationProviderError("Live Postmark adapter not configured.");
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
    return {
      messageId,
      status: "delivered",
    };
  }
}

export function createPostmarkCommunicationService(config: PostmarkConfig = {}): CommunicationService {
  return new PostmarkCommunicationService(config);
}
