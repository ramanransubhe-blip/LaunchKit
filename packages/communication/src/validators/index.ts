import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.string().email("Valid recipient email is required"),
  subject: z.string().min(1, "Subject cannot be empty"),
  templateName: z.string().min(1, "Template name is required"),
  variables: z.record(z.unknown()).optional(),
});

export const sendNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title cannot be empty"),
  body: z.string().min(1, "Notification body cannot be empty"),
  priority: z.enum(["low", "normal", "high"]).optional(),
  category: z.string().optional(),
});

export const sendAnnouncementSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  body: z.string().min(1, "Announcement body cannot be empty"),
  organizationId: z.string().optional(),
  isDismissible: z.boolean().optional(),
});

export const scheduleEmailSchema = z.object({
  time: z.coerce.date(),
  templateName: z.string().min(1, "Template name is required"),
  to: z.string().email("Valid recipient email is required"),
  variables: z.record(z.unknown()).optional(),
});

export function validatePayload<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Communication validation failed: ${result.error.errors.map((e) => e.message).join(", ")}`);
  }
  return result.data;
}

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type SendAnnouncementInput = z.infer<typeof sendAnnouncementSchema>;
export type ScheduleEmailInput = z.infer<typeof scheduleEmailSchema>;
