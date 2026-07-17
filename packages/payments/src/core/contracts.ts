// Reusable abstract payment gateway contracts

export enum BillingModel {
  Subscription = "subscription",
  OneTime = "one_time",
  UsageBased = "usage_based",
  Credits = "credits",
  Seats = "seats",
}

export enum SubscriptionStatus {
  Active = "active",
  Canceled = "canceled",
  PastDue = "past_due",
  Incomplete = "incomplete",
  Paused = "paused",
}

export interface BillingCustomer {
  id: string;
  email: string;
  name: string | null;
  metadata: Record<string, unknown>;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

export interface BillingCheckout {
  id: string;
  url: string;
  customerId: string;
  priceId: string;
}

export interface BillingSubscription {
  id: string;
  customerId: string;
  priceId: string;
  status: SubscriptionStatus;
  quantity: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
}

export interface BillingPortal {
  url: string;
}

export interface BillingInvoice {
  id: string;
  number: string;
  amountDue: number; // in cents
  amountPaid: number; // in cents
  status: string;
  pdfUrl: string | null;
  createdAt: Date;
}

export interface BillingUsage {
  organizationId: string;
  featureName: string;
  usageValue: number;
  limitValue: number;
  resetAt: Date;
}

export interface BillingCredits {
  organizationId: string;
  balance: number;
  expiresAt: Date | null;
}

export interface BillingRefund {
  id: string;
  amount: number;
  status: string;
}

export interface BillingWebhookEvent {
  type: string;
  id: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

// Independent BillingService Contract
export interface BillingService {
  readonly providerName: string;

  createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, unknown>
  ): Promise<BillingCustomer>;
  updateCustomer(customerId: string, data: UpdateCustomerData): Promise<BillingCustomer>;
  deleteCustomer(customerId: string): Promise<void>;

  createCheckout(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<BillingCheckout>;
  createSubscription(customerId: string, priceId: string): Promise<BillingSubscription>;
  cancelSubscription(subscriptionId: string): Promise<BillingSubscription>;
  pauseSubscription(subscriptionId: string): Promise<BillingSubscription>;
  resumeSubscription(subscriptionId: string): Promise<BillingSubscription>;
  upgradePlan(subscriptionId: string, newPriceId: string): Promise<BillingSubscription>;
  downgradePlan(subscriptionId: string, newPriceId: string): Promise<BillingSubscription>;

  createPortal(customerId: string, returnUrl: string): Promise<BillingPortal>;
  listInvoices(customerId: string): Promise<readonly BillingInvoice[]>;
  downloadInvoice(invoiceId: string): Promise<string>;

  getSubscription(subscriptionId: string): Promise<BillingSubscription | null>;
  getUsage(organizationId: string, featureName: string): Promise<BillingUsage>;
  addCredits(organizationId: string, amount: number): Promise<BillingCredits>;
  consumeCredits(organizationId: string, amount: number): Promise<BillingCredits>;

  createRefund(paymentId: string, amount?: number): Promise<BillingRefund>;
  validateWebhook(rawBody: string, signature: string, secret: string): Promise<BillingWebhookEvent>;
}
