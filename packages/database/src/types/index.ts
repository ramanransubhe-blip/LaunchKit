import * as schema from "../schema";

// Core Models
export type Profile = typeof schema.profiles.$inferSelect;
export type InsertProfile = typeof schema.profiles.$inferInsert;

export type Organization = typeof schema.organizations.$inferSelect;
export type InsertOrganization = typeof schema.organizations.$inferInsert;

export type OrganizationMember = typeof schema.organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof schema.organizationMembers.$inferInsert;

export type Team = typeof schema.teams.$inferSelect;
export type InsertTeam = typeof schema.teams.$inferInsert;

export type TeamMember = typeof schema.teamMembers.$inferSelect;
export type InsertTeamMember = typeof schema.teamMembers.$inferInsert;

export type Role = typeof schema.roles.$inferSelect;
export type InsertRole = typeof schema.roles.$inferInsert;

export type Permission = typeof schema.permissions.$inferSelect;
export type InsertPermission = typeof schema.permissions.$inferInsert;

// Auth Models
export type Session = typeof schema.sessions.$inferSelect;
export type InsertSession = typeof schema.sessions.$inferInsert;

export type Device = typeof schema.devices.$inferSelect;
export type InsertDevice = typeof schema.devices.$inferInsert;

export type LoginHistory = typeof schema.loginHistory.$inferSelect;
export type InsertLoginHistory = typeof schema.loginHistory.$inferInsert;

export type VerificationToken = typeof schema.verificationTokens.$inferSelect;
export type InsertVerificationToken = typeof schema.verificationTokens.$inferInsert;

export type MagicLink = typeof schema.magicLinks.$inferSelect;
export type InsertMagicLink = typeof schema.magicLinks.$inferInsert;

export type OAuthAccount = typeof schema.oauthAccounts.$inferSelect;
export type InsertOAuthAccount = typeof schema.oauthAccounts.$inferInsert;

// Billing Models
export type Plan = typeof schema.plans.$inferSelect;
export type InsertPlan = typeof schema.plans.$inferInsert;

export type Product = typeof schema.products.$inferSelect;
export type InsertProduct = typeof schema.products.$inferInsert;

export type Price = typeof schema.prices.$inferSelect;
export type InsertPrice = typeof schema.prices.$inferInsert;

export type Subscription = typeof schema.subscriptions.$inferSelect;
export type InsertSubscription = typeof schema.subscriptions.$inferInsert;

export type PaymentCustomer = typeof schema.paymentCustomers.$inferSelect;
export type InsertPaymentCustomer = typeof schema.paymentCustomers.$inferInsert;

export type PaymentMethod = typeof schema.paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof schema.paymentMethods.$inferInsert;

export type PaymentHistory = typeof schema.paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof schema.paymentHistory.$inferInsert;

export type Invoice = typeof schema.invoices.$inferSelect;
export type InsertInvoice = typeof schema.invoices.$inferInsert;

export type Credit = typeof schema.credits.$inferSelect;
export type InsertCredit = typeof schema.credits.$inferInsert;

export type UsageTracking = typeof schema.usageTracking.$inferSelect;
export type InsertUsageTracking = typeof schema.usageTracking.$inferInsert;

// AI Models
export type AIModel = typeof schema.aiModels.$inferSelect;
export type InsertAIModel = typeof schema.aiModels.$inferInsert;

export type AIConversation = typeof schema.aiConversations.$inferSelect;
export type InsertAIConversation = typeof schema.aiConversations.$inferInsert;

export type AIMessage = typeof schema.aiMessages.$inferSelect;
export type InsertAIMessage = typeof schema.aiMessages.$inferInsert;

export type PromptTemplate = typeof schema.promptTemplates.$inferSelect;
export type InsertPromptTemplate = typeof schema.promptTemplates.$inferInsert;

export type ToolCall = typeof schema.toolCalls.$inferSelect;
export type InsertToolCall = typeof schema.toolCalls.$inferInsert;

export type AIUsage = typeof schema.aiUsage.$inferSelect;
export type InsertAIUsage = typeof schema.aiUsage.$inferInsert;

export type ModelUsage = typeof schema.modelUsage.$inferSelect;
export type InsertModelUsage = typeof schema.modelUsage.$inferInsert;

// Storage Models
export type Folder = typeof schema.folders.$inferSelect;
export type InsertFolder = typeof schema.folders.$inferInsert;

export type File = typeof schema.files.$inferSelect;
export type InsertFile = typeof schema.files.$inferInsert;

export type Upload = typeof schema.uploads.$inferSelect;
export type InsertUpload = typeof schema.uploads.$inferInsert;

export type Media = typeof schema.media.$inferSelect;
export type InsertMedia = typeof schema.media.$inferInsert;

// Application Models
export type Notification = typeof schema.notifications.$inferSelect;
export type InsertNotification = typeof schema.notifications.$inferInsert;

export type NotificationPreference = typeof schema.notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof schema.notificationPreferences.$inferInsert;

export type Feedback = typeof schema.feedback.$inferSelect;
export type InsertFeedback = typeof schema.feedback.$inferInsert;

export type SupportTicket = typeof schema.supportTickets.$inferSelect;
export type InsertSupportTicket = typeof schema.supportTickets.$inferInsert;

export type AuditLog = typeof schema.auditLogs.$inferSelect;
export type InsertAuditLog = typeof schema.auditLogs.$inferInsert;

export type ActivityLog = typeof schema.activityLogs.$inferSelect;
export type InsertActivityLog = typeof schema.activityLogs.$inferInsert;

export type FeatureFlag = typeof schema.featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof schema.featureFlags.$inferInsert;

export type FeatureFlagAssignment = typeof schema.featureFlagAssignments.$inferSelect;
export type InsertFeatureFlagAssignment = typeof schema.featureFlagAssignments.$inferInsert;

export type Waitlist = typeof schema.waitlist.$inferSelect;
export type InsertWaitlist = typeof schema.waitlist.$inferInsert;

export type ContactMessage = typeof schema.contactMessages.$inferSelect;
export type InsertContactMessage = typeof schema.contactMessages.$inferInsert;

export type Announcement = typeof schema.announcements.$inferSelect;
export type InsertAnnouncement = typeof schema.announcements.$inferInsert;

// API Models
export type APIKey = typeof schema.apiKeys.$inferSelect;
export type InsertAPIKey = typeof schema.apiKeys.$inferInsert;

export type APIRequest = typeof schema.apiRequests.$inferSelect;
export type InsertAPIRequest = typeof schema.apiRequests.$inferInsert;

export type WebhookLog = typeof schema.webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof schema.webhookLogs.$inferInsert;

export type RateLimit = typeof schema.rateLimits.$inferSelect;
export type InsertRateLimit = typeof schema.rateLimits.$inferInsert;

// System Models
export type SystemSetting = typeof schema.systemSettings.$inferSelect;
export type InsertSystemSetting = typeof schema.systemSettings.$inferInsert;

export type JobQueue = typeof schema.jobQueue.$inferSelect;
export type InsertJobQueue = typeof schema.jobQueue.$inferInsert;

export type CronLog = typeof schema.cronLogs.$inferSelect;
export type InsertCronLog = typeof schema.cronLogs.$inferInsert;

export type ErrorLog = typeof schema.errorLogs.$inferSelect;
export type InsertErrorLog = typeof schema.errorLogs.$inferInsert;
