import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizations, profiles } from "./core";

// 1. Plans Table (High-level plan grouping)
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Products Table (Maps 1-to-1 with Stripe Products)
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    active: boolean("active").default(true).notNull(),
    imageUrl: text("image_url"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("products_plan_idx").on(t.planId)]
);

// 3. Prices Table (Recurring tiers or flat fees)
export const prices = pgTable(
  "prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    active: boolean("active").default(true).notNull(),
    currency: text("currency").default("usd").notNull(),
    unitAmount: integer("unit_amount").notNull(), // Amount in cents
    type: text("type").default("recurring").notNull(), // "recurring" or "one_time"
    interval: text("interval"), // "month", "year", or null
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("prices_product_idx").on(t.productId)]
);

// 4. Payment Customers Table (Binds Organizations to Stripe Customer IDs)
export const paymentCustomers = pgTable(
  "payment_customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").default("stripe").notNull(), // e.g. "stripe", "paypal"
    customerId: text("customer_id").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("payment_cust_org_idx").on(t.organizationId)]
);

// 5. Payment Methods Table
export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentCustomerId: uuid("payment_customer_id")
      .references(() => paymentCustomers.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type").notNull(), // e.g. "card", "paypal"
    last4: text("last4"),
    brand: text("brand"), // e.g. "visa", "mastercard"
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("payment_methods_customer_idx").on(t.paymentCustomerId)]
);

// 6. Subscriptions Table
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    priceId: uuid("price_id")
      .references(() => prices.id, { onDelete: "restrict" })
      .notNull(),
    plan: text("plan"),
    status: text("status").notNull(), // e.g. "active", "canceled", "incomplete", "past_due"
    quantity: integer("quantity").default(1).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("subscriptions_org_idx").on(t.organizationId),
    index("subscriptions_user_idx").on(t.userId),
    index("subscriptions_price_idx").on(t.priceId),
  ]
);

// 7. Ledger Payment History
export const paymentHistory = pgTable(
  "payment_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    amount: integer("amount").notNull(), // In cents
    currency: text("currency").default("usd").notNull(),
    status: text("status").notNull(), // e.g. "succeeded", "failed"
    providerTxId: text("provider_tx_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("payment_history_org_idx").on(t.organizationId)]
);

// 8. Invoices Table
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    number: text("number").notNull().unique(), // Invoice number from provider
    amountDue: integer("amount_due").notNull(),
    amountPaid: integer("amount_paid").notNull(),
    status: text("status").notNull(), // e.g. "paid", "open", "uncollectible"
    pdfUrl: text("pdf_url"),
    hostedInvoiceUrl: text("hosted_invoice_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("invoices_subscription_idx").on(t.subscriptionId),
    index("invoices_org_idx").on(t.organizationId),
  ]
);

// 9. Credits Table (Prepaid credits or balance system)
export const credits = pgTable(
  "credits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    balance: integer("balance").default(0).notNull(), // e.g. number of query credits remaining
    currency: text("currency").default("tokens").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("credits_org_idx").on(t.organizationId)]
);

// 10. Usage Tracking Table
export const usageTracking = pgTable(
  "usage_tracking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    featureName: text("feature_name").notNull(), // e.g. "api_requests", "storage_mb"
    usageValue: integer("usage_value").default(0).notNull(),
    limitValue: integer("limit_value").notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("usage_tracking_org_idx").on(t.organizationId),
    uniqueIndex("usage_tracking_org_feature_idx").on(t.organizationId, t.featureName),
  ]
);
