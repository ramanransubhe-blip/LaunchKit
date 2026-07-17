import { BaseRepository } from "./base";
import { SupportTicket, InsertSupportTicket } from "../types";
import { supportTickets, announcements, feedback } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export class SupportRepository extends BaseRepository<
  SupportTicket,
  InsertSupportTicket,
  typeof supportTickets
> {
  constructor() {
    super(supportTickets);
  }

  // Create a new support ticket
  async createTicket(
    profileId: string,
    subject: string,
    description: string,
    priority: "low" | "normal" | "high" = "normal"
  ): Promise<SupportTicket> {
    return await this.insert({
      profileId,
      subject,
      description,
      priority,
    });
  }

  // Post dynamic banner announcements
  async publishAnnouncement(data: {
    title: string;
    content: string;
    type?: string;
  }): Promise<void> {
    await this.db.insert(announcements).values({
      ...data,
      publishedAt: new Date(),
    });
  }

  // List current active announcements
  async getActiveAnnouncements(): Promise<any[]> {
    return await this.db
      .select()
      .from(announcements)
      .where(sql`${announcements.publishedAt} <= NOW()`)
      .orderBy(announcements.publishedAt);
  }

  // Record feedback ratings
  async submitFeedback(data: {
    profileId: string;
    category: string;
    rating: number;
    comment?: string;
  }): Promise<void> {
    await this.db.insert(feedback).values(data);
  }
}
