import { BaseRepository } from "./base";
import { Notification, InsertNotification } from "../types";
import { notifications, notificationPreferences } from "../schema";
import { eq, and } from "drizzle-orm";

export class NotificationRepository extends BaseRepository<
  Notification,
  InsertNotification,
  typeof notifications
> {
  constructor() {
    super(notifications);
  }

  // Get unread notifications for a user profile
  async findUnread(profileId: string): Promise<Notification[]> {
    return await this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.profileId, profileId), eq(notifications.isRead, false)));
  }

  // Mark a notification as read
  async markAsRead(id: string): Promise<boolean> {
    const results = await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return results.length > 0;
  }

  // Mark all notifications as read
  async markAllAsRead(profileId: string): Promise<number> {
    const results = await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.profileId, profileId), eq(notifications.isRead, false)))
      .returning();
    return results.length;
  }

  // Get notification channel preferences
  async getPreferences(profileId: string): Promise<any[]> {
    return await this.db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.profileId, profileId));
  }

  // Update a notification preference
  async updatePreference(profileId: string, channel: string, enabled: boolean): Promise<void> {
    await this.db
      .insert(notificationPreferences)
      .values({
        profileId,
        channel,
        enabled,
      })
      .onConflictDoUpdate({
        target: [notificationPreferences.profileId, notificationPreferences.channel],
        set: { enabled },
      });
  }
}
