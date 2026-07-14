import { sendEmail } from "@devlaunchkit/communication";
import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";

const logger = createLogger({ service: "notifications" });

interface NotificationPayload {
  userId: string;
  type: "subscription_created" | "subscription_cancelled" | "payment_received" | "trial_ending";
  metadata?: Record<string, unknown>;
}

/**
 * Send a transactional notification to a user via Resend.
 * Looks up the user's email and dispatches the appropriate template.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const user = await db("users").where({ id: payload.userId }).first();
  if (!user?.email) {
    logger.warn("Cannot send notification — user email not found", { userId: payload.userId });
    return;
  }

  const templates: Record<NotificationPayload["type"], { subject: string; template: string }> = {
    subscription_created: {
      subject: "Welcome to your new plan!",
      template: "subscription-welcome",
    },
    subscription_cancelled: {
      subject: "Your subscription has been cancelled",
      template: "subscription-cancelled",
    },
    payment_received: {
      subject: "Payment receipt",
      template: "payment-receipt",
    },
    trial_ending: {
      subject: "Your trial ends in 3 days",
      template: "trial-ending",
    },
  };

  const config = templates[payload.type];

  try {
    await sendEmail({
      to: user.email,
      subject: config.subject,
      template: config.template,
      data: { name: user.name, ...payload.metadata },
    });

    await db("notification_logs").insert({
      user_id: payload.userId,
      type: payload.type,
      channel: "email",
      status: "sent",
      created_at: new Date(),
    });

    logger.info("Notification sent", { userId: payload.userId, type: payload.type });
  } catch (error) {
    await db("notification_logs").insert({
      user_id: payload.userId,
      type: payload.type,
      channel: "email",
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      created_at: new Date(),
    });

    logger.error("Failed to send notification", { error, userId: payload.userId });
    throw error;
  }
}
