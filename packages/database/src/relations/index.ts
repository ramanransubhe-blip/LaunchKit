import { relations } from "drizzle-orm";
import * as schema from "../schema";

// 1. Profiles Relations
export const profilesRelations = relations(schema.profiles, ({ many }) => ({
  userRoles: many(schema.userRoles),
  organizationMembers: many(schema.organizationMembers),
  teamMembers: many(schema.teamMembers),
  sessions: many(schema.sessions),
  devices: many(schema.devices),
  loginHistory: many(schema.loginHistory),
  oauthAccounts: many(schema.oauthAccounts),
  aiConversations: many(schema.aiConversations),
  aiUsage: many(schema.aiUsage),
  uploads: many(schema.uploads),
  notifications: many(schema.notifications),
  notificationPreferences: many(schema.notificationPreferences),
  feedback: many(schema.feedback),
  supportTickets: many(schema.supportTickets),
  auditLogs: many(schema.auditLogs),
  activityLogs: many(schema.activityLogs),
}));

// 2. Organizations Relations
export const organizationsRelations = relations(schema.organizations, ({ many }) => ({
  members: many(schema.organizationMembers),
  teams: many(schema.teams),
  paymentCustomers: many(schema.paymentCustomers),
  subscriptions: many(schema.subscriptions),
  paymentHistory: many(schema.paymentHistory),
  invoices: many(schema.invoices),
  credits: many(schema.credits),
  usageTracking: many(schema.usageTracking),
  folders: many(schema.folders),
  files: many(schema.files),
  activityLogs: many(schema.activityLogs),
  apiKeys: many(schema.apiKeys),
}));

// 3. Teams Relations
export const teamsRelations = relations(schema.teams, ({ one, many }) => ({
  organization: one(schema.organizations, {
    fields: [schema.teams.organizationId],
    references: [schema.organizations.id],
  }),
  members: many(schema.teamMembers),
}));

// 4. Team Members Relations
export const teamMembersRelations = relations(schema.teamMembers, ({ one }) => ({
  team: one(schema.teams, {
    fields: [schema.teamMembers.teamId],
    references: [schema.teams.id],
  }),
  profile: one(schema.profiles, {
    fields: [schema.teamMembers.profileId],
    references: [schema.profiles.id],
  }),
}));

// 5. Organization Members Relations
export const organizationMembersRelations = relations(schema.organizationMembers, ({ one }) => ({
  organization: one(schema.organizations, {
    fields: [schema.organizationMembers.organizationId],
    references: [schema.organizations.id],
  }),
  profile: one(schema.profiles, {
    fields: [schema.organizationMembers.profileId],
    references: [schema.profiles.id],
  }),
  role: one(schema.roles, {
    fields: [schema.organizationMembers.roleId],
    references: [schema.roles.id],
  }),
}));

// 6. User Roles Relations
export const userRolesRelations = relations(schema.userRoles, ({ one }) => ({
  profile: one(schema.profiles, {
    fields: [schema.userRoles.profileId],
    references: [schema.profiles.id],
  }),
  role: one(schema.roles, {
    fields: [schema.userRoles.roleId],
    references: [schema.roles.id],
  }),
}));

// 7. Role Permissions Relations
export const rolePermissionsRelations = relations(schema.rolePermissions, ({ one }) => ({
  role: one(schema.roles, {
    fields: [schema.rolePermissions.roleId],
    references: [schema.roles.id],
  }),
  permission: one(schema.permissions, {
    fields: [schema.rolePermissions.permissionId],
    references: [schema.permissions.id],
  }),
}));

// 8. Roles Relations
export const rolesRelations = relations(schema.roles, ({ many }) => ({
  rolePermissions: many(schema.rolePermissions),
  userRoles: many(schema.userRoles),
  organizationMembers: many(schema.organizationMembers),
}));

// 9. Permissions Relations
export const permissionsRelations = relations(schema.permissions, ({ many }) => ({
  rolePermissions: many(schema.rolePermissions),
}));

// 10. Sessions Relations
export const sessionsRelations = relations(schema.sessions, ({ one }) => ({
  profile: one(schema.profiles, {
    fields: [schema.sessions.profileId],
    references: [schema.profiles.id],
  }),
}));

// 11. Devices Relations
export const devicesRelations = relations(schema.devices, ({ one }) => ({
  profile: one(schema.profiles, {
    fields: [schema.devices.profileId],
    references: [schema.profiles.id],
  }),
}));

// 12. OAuth Accounts Relations
export const oauthAccountsRelations = relations(schema.oauthAccounts, ({ one }) => ({
  profile: one(schema.profiles, {
    fields: [schema.oauthAccounts.profileId],
    references: [schema.profiles.id],
  }),
}));

// 13. Subscriptions Relations
export const subscriptionsRelations = relations(schema.subscriptions, ({ one, many }) => ({
  organization: one(schema.organizations, {
    fields: [schema.subscriptions.organizationId],
    references: [schema.organizations.id],
  }),
  price: one(schema.prices, {
    fields: [schema.subscriptions.priceId],
    references: [schema.prices.id],
  }),
  invoices: many(schema.invoices),
}));

// 14. Prices Relations
export const pricesRelations = relations(schema.prices, ({ one, many }) => ({
  product: one(schema.products, {
    fields: [schema.prices.productId],
    references: [schema.products.id],
  }),
  subscriptions: many(schema.subscriptions),
}));

// 15. Products Relations
export const productsRelations = relations(schema.products, ({ one, many }) => ({
  plan: one(schema.plans, {
    fields: [schema.products.planId],
    references: [schema.plans.id],
  }),
  prices: many(schema.prices),
}));

// 16. Plans Relations
export const plansRelations = relations(schema.plans, ({ many }) => ({
  products: many(schema.products),
}));

// 17. Invoices Relations
export const invoicesRelations = relations(schema.invoices, ({ one }) => ({
  subscription: one(schema.subscriptions, {
    fields: [schema.invoices.subscriptionId],
    references: [schema.subscriptions.id],
  }),
  organization: one(schema.organizations, {
    fields: [schema.invoices.organizationId],
    references: [schema.organizations.id],
  }),
}));

// 18. AI Conversations Relations
export const aiConversationsRelations = relations(schema.aiConversations, ({ one, many }) => ({
  profile: one(schema.profiles, {
    fields: [schema.aiConversations.profileId],
    references: [schema.profiles.id],
  }),
  messages: many(schema.aiMessages),
  usage: many(schema.modelUsage),
}));

// 19. AI Messages Relations
export const aiMessagesRelations = relations(schema.aiMessages, ({ one, many }) => ({
  conversation: one(schema.aiConversations, {
    fields: [schema.aiMessages.conversationId],
    references: [schema.aiConversations.id],
  }),
  toolCalls: many(schema.toolCalls),
}));

// 20. Tool Calls Relations
export const toolCallsRelations = relations(schema.toolCalls, ({ one }) => ({
  message: one(schema.aiMessages, {
    fields: [schema.toolCalls.messageId],
    references: [schema.aiMessages.id],
  }),
}));

// 21. Folders Relations
export const foldersRelations = relations(schema.folders, ({ one, many }) => ({
  organization: one(schema.organizations, {
    fields: [schema.folders.organizationId],
    references: [schema.organizations.id],
  }),
  parent: one(schema.folders, {
    fields: [schema.folders.parentId],
    references: [schema.folders.id],
    relationName: "folder_parent",
  }),
  children: many(schema.folders, {
    relationName: "folder_parent",
  }),
  files: many(schema.files),
}));

// 22. Files Relations
export const filesRelations = relations(schema.files, ({ one, many }) => ({
  folder: one(schema.folders, {
    fields: [schema.files.folderId],
    references: [schema.folders.id],
  }),
  organization: one(schema.organizations, {
    fields: [schema.files.organizationId],
    references: [schema.organizations.id],
  }),
  media: many(schema.media),
}));

// 23. Media Relations
export const mediaRelations = relations(schema.media, ({ one }) => ({
  file: one(schema.files, {
    fields: [schema.media.fileId],
    references: [schema.files.id],
  }),
}));

// 24. API Keys Relations
export const apiKeysRelations = relations(schema.apiKeys, ({ one, many }) => ({
  organization: one(schema.organizations, {
    fields: [schema.apiKeys.organizationId],
    references: [schema.organizations.id],
  }),
  requests: many(schema.apiRequests),
}));

// 25. API Requests Relations
export const apiRequestsRelations = relations(schema.apiRequests, ({ one }) => ({
  apiKey: one(schema.apiKeys, {
    fields: [schema.apiRequests.apiKeyId],
    references: [schema.apiKeys.id],
  }),
}));
