export interface EmailOptions {
  readonly from?: string;
  readonly attachments?: readonly { filename: string; content: Buffer }[];
}

export interface EmailSendResult {
  readonly messageId: string;
  readonly status: "queued" | "sent" | "delivered" | "failed";
}

export interface NotificationOptions {
  readonly category?: string;
  readonly priority?: "low" | "normal" | "high";
}

export interface NotificationSendResult {
  readonly notificationId: string;
}

export interface AnnouncementOptions {
  readonly organizationId?: string;
  readonly isDismissible?: boolean;
  readonly expiresAt?: Date;
}

export interface AnnouncementSendResult {
  readonly announcementId: string;
}

export interface DeliveryStatus {
  readonly messageId: string;
  readonly status: "queued" | "sent" | "delivered" | "opened" | "clicked" | "failed";
  readonly details?: string;
}

// Reusable provider-independent CommunicationService contract
export interface CommunicationService {
  readonly providerName: string;

  sendEmail(
    to: string,
    subject: string,
    templateName: string,
    variables?: Record<string, unknown>,
    options?: EmailOptions
  ): Promise<EmailSendResult>;
  sendNotification(
    userId: string,
    title: string,
    body: string,
    options?: NotificationOptions
  ): Promise<NotificationSendResult>;
  sendAnnouncement(
    title: string,
    body: string,
    options?: AnnouncementOptions
  ): Promise<AnnouncementSendResult>;
  schedule(
    time: Date,
    templateName: string,
    to: string,
    variables?: Record<string, unknown>
  ): Promise<string>;
  cancel(scheduleId: string): Promise<void>;
  track(messageId: string): Promise<DeliveryStatus>;
}
