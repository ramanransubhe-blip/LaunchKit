import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as schema from "../schema";
import { z } from "zod";

// Core Validators
export const insertProfileSchema = createInsertSchema(schema.profiles, {
  email: z.string().email(),
});
export const selectProfileSchema = createSelectSchema(schema.profiles);

export const insertOrganizationSchema = createInsertSchema(schema.organizations, {
  slug: z.string().min(2).max(50),
});
export const selectOrganizationSchema = createSelectSchema(schema.organizations);

export const insertOrganizationMemberSchema = createInsertSchema(schema.organizationMembers);
export const selectOrganizationMemberSchema = createSelectSchema(schema.organizationMembers);

export const insertTeamSchema = createInsertSchema(schema.teams);
export const selectTeamSchema = createSelectSchema(schema.teams);

export const insertTeamMemberSchema = createInsertSchema(schema.teamMembers);
export const selectTeamMemberSchema = createSelectSchema(schema.teamMembers);

export const insertRoleSchema = createInsertSchema(schema.roles);
export const selectRoleSchema = createSelectSchema(schema.roles);

export const insertPermissionSchema = createInsertSchema(schema.permissions);
export const selectPermissionSchema = createSelectSchema(schema.permissions);

// Auth Validators
export const insertSessionSchema = createInsertSchema(schema.sessions);
export const selectSessionSchema = createSelectSchema(schema.sessions);

export const insertDeviceSchema = createInsertSchema(schema.devices);
export const selectDeviceSchema = createSelectSchema(schema.devices);

export const insertLoginHistorySchema = createInsertSchema(schema.loginHistory);
export const selectLoginHistorySchema = createSelectSchema(schema.loginHistory);

export const insertVerificationTokenSchema = createInsertSchema(schema.verificationTokens);
export const selectVerificationTokenSchema = createSelectSchema(schema.verificationTokens);

export const insertMagicLinkSchema = createInsertSchema(schema.magicLinks);
export const selectMagicLinkSchema = createSelectSchema(schema.magicLinks);

export const insertOAuthAccountSchema = createInsertSchema(schema.oauthAccounts);
export const selectOAuthAccountSchema = createSelectSchema(schema.oauthAccounts);

// Billing Validators
export const insertPlanSchema = createInsertSchema(schema.plans);
export const selectPlanSchema = createSelectSchema(schema.plans);

export const insertProductSchema = createInsertSchema(schema.products);
export const selectProductSchema = createSelectSchema(schema.products);

export const insertPriceSchema = createInsertSchema(schema.prices);
export const selectPriceSchema = createSelectSchema(schema.prices);

export const insertSubscriptionSchema = createInsertSchema(schema.subscriptions);
export const selectSubscriptionSchema = createSelectSchema(schema.subscriptions);

export const insertPaymentCustomerSchema = createInsertSchema(schema.paymentCustomers);
export const selectPaymentCustomerSchema = createSelectSchema(schema.paymentCustomers);

export const insertPaymentMethodSchema = createInsertSchema(schema.paymentMethods);
export const selectPaymentMethodSchema = createSelectSchema(schema.paymentMethods);

export const insertPaymentHistorySchema = createInsertSchema(schema.paymentHistory);
export const selectPaymentHistorySchema = createSelectSchema(schema.paymentHistory);

export const insertInvoiceSchema = createInsertSchema(schema.invoices);
export const selectInvoiceSchema = createSelectSchema(schema.invoices);

export const insertCreditSchema = createInsertSchema(schema.credits);
export const selectCreditSchema = createSelectSchema(schema.credits);

export const insertUsageTrackingSchema = createInsertSchema(schema.usageTracking);
export const selectUsageTrackingSchema = createSelectSchema(schema.usageTracking);

// AI Validators
export const insertAIModelSchema = createInsertSchema(schema.aiModels);
export const selectAIModelSchema = createSelectSchema(schema.aiModels);

export const insertAIConversationSchema = createInsertSchema(schema.aiConversations);
export const selectAIConversationSchema = createSelectSchema(schema.aiConversations);

export const insertAIMessageSchema = createInsertSchema(schema.aiMessages);
export const selectAIMessageSchema = createSelectSchema(schema.aiMessages);

export const insertPromptTemplateSchema = createInsertSchema(schema.promptTemplates);
export const selectPromptTemplateSchema = createSelectSchema(schema.promptTemplates);

export const insertToolCallSchema = createInsertSchema(schema.toolCalls);
export const selectToolCallSchema = createSelectSchema(schema.toolCalls);

export const insertAIUsageSchema = createInsertSchema(schema.aiUsage);
export const selectAIUsageSchema = createSelectSchema(schema.aiUsage);

export const insertModelUsageSchema = createInsertSchema(schema.modelUsage);
export const selectModelUsageSchema = createSelectSchema(schema.modelUsage);

// Storage Validators
export const insertFolderSchema = createInsertSchema(schema.folders);
export const selectFolderSchema = createSelectSchema(schema.folders);

export const insertFileSchema = createInsertSchema(schema.files);
export const selectFileSchema = createSelectSchema(schema.files);

export const insertUploadSchema = createInsertSchema(schema.uploads);
export const selectUploadSchema = createSelectSchema(schema.uploads);

export const insertMediaSchema = createInsertSchema(schema.media);
export const selectMediaSchema = createSelectSchema(schema.media);

// Application Validators
export const insertNotificationSchema = createInsertSchema(schema.notifications);
export const selectNotificationSchema = createSelectSchema(schema.notifications);

export const insertNotificationPreferenceSchema = createInsertSchema(
  schema.notificationPreferences
);
export const selectNotificationPreferenceSchema = createSelectSchema(
  schema.notificationPreferences
);

export const insertFeedbackSchema = createInsertSchema(schema.feedback);
export const selectFeedbackSchema = createSelectSchema(schema.feedback);

export const insertSupportTicketSchema = createInsertSchema(schema.supportTickets);
export const selectSupportTicketSchema = createSelectSchema(schema.supportTickets);

export const insertAuditLogSchema = createInsertSchema(schema.auditLogs);
export const selectAuditLogSchema = createSelectSchema(schema.auditLogs);

export const insertActivityLogSchema = createInsertSchema(schema.activityLogs);
export const selectActivityLogSchema = createSelectSchema(schema.activityLogs);

export const insertFeatureFlagSchema = createInsertSchema(schema.featureFlags);
export const selectFeatureFlagSchema = createSelectSchema(schema.featureFlags);

export const insertFeatureFlagAssignmentSchema = createInsertSchema(schema.featureFlagAssignments);
export const selectFeatureFlagAssignmentSchema = createSelectSchema(schema.featureFlagAssignments);

export const insertWaitlistSchema = createInsertSchema(schema.waitlist);
export const selectWaitlistSchema = createSelectSchema(schema.waitlist);

export const insertContactMessageSchema = createInsertSchema(schema.contactMessages);
export const selectContactMessageSchema = createSelectSchema(schema.contactMessages);

export const insertAnnouncementSchema = createInsertSchema(schema.announcements);
export const selectAnnouncementSchema = createSelectSchema(schema.announcements);

// API Validators
export const insertAPIKeySchema = createInsertSchema(schema.apiKeys);
export const selectAPIKeySchema = createSelectSchema(schema.apiKeys);

export const insertAPIRequestSchema = createInsertSchema(schema.apiRequests);
export const selectAPIRequestSchema = createSelectSchema(schema.apiRequests);

export const insertWebhookLogSchema = createInsertSchema(schema.webhookLogs);
export const selectWebhookLogSchema = createSelectSchema(schema.webhookLogs);

export const insertRateLimitSchema = createInsertSchema(schema.rateLimits);
export const selectRateLimitSchema = createSelectSchema(schema.rateLimits);

// System Validators
export const insertSystemSettingSchema = createInsertSchema(schema.systemSettings);
export const selectSystemSettingSchema = createSelectSchema(schema.systemSettings);

export const insertJobQueueSchema = createInsertSchema(schema.jobQueue);
export const selectJobQueueSchema = createSelectSchema(schema.jobQueue);

export const insertCronLogSchema = createInsertSchema(schema.cronLogs);
export const selectCronLogSchema = createSelectSchema(schema.cronLogs);

export const insertErrorLogSchema = createInsertSchema(schema.errorLogs);
export const selectErrorLogSchema = createSelectSchema(schema.errorLogs);
