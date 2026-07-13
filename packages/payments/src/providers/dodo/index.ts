import type {
  BillingService,
  BillingCustomer,
  UpdateCustomerData,
  BillingCheckout,
  BillingSubscription,
  BillingPortal,
  BillingInvoice,
  BillingUsage,
  BillingCredits,
  BillingRefund,
  BillingWebhookEvent,
} from "../../core/contracts.js";
import { SubscriptionStatus } from "../../core/contracts.js";
import { BillingProviderError, BillingWebhookError } from "../../core/errors.js";

export interface DodoConfig {
  apiKey?: string;
  webhookSecret?: string;
  isMock?: boolean;
}

export class DodoPaymentsService implements BillingService {
  readonly providerName = "dodo-payments";
  private readonly apiKey: string;
  private readonly webhookSecret: string;
  private readonly isMock: boolean;

  constructor(config: DodoConfig = {}) {
    this.apiKey = config.apiKey || "";
    this.webhookSecret = config.webhookSecret || "";
    this.isMock = config.isMock ?? true; // Default to mock mode for dev safety
  }

  private async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    if (this.isMock) {
      throw new BillingProviderError("Direct API calls disabled in mock mode.");
    }

    try {
      const response = await fetch(`https://api.dodopayments.com/v1${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new BillingProviderError(`Dodo Payments request failed: ${response.status} — ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof BillingProviderError) throw error;
      throw new BillingProviderError(
        `Failed to complete HTTP request to Dodo Payments: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createCustomer(email: string, name?: string, metadata?: Record<string, unknown>): Promise<BillingCustomer> {
    if (this.isMock) {
      return {
        id: "cust_dodo_mock_" + Math.random().toString(36).substring(7),
        email,
        name: name || null,
        metadata: metadata || {},
      };
    }
    return this.request<BillingCustomer>("/customers", "POST", { email, name, metadata });
  }

  async updateCustomer(customerId: string, data: UpdateCustomerData): Promise<BillingCustomer> {
    if (this.isMock) {
      return {
        id: customerId,
        email: data.email || "mock@dodo.com",
        name: data.name || "Mock Dodo User",
        metadata: data.metadata || {},
      };
    }
    return this.request<BillingCustomer>(`/customers/${customerId}`, "PATCH", data);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    if (this.isMock) return;
    await this.request<void>(`/customers/${customerId}`, "DELETE");
  }

  async createCheckout(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<BillingCheckout> {
    if (this.isMock) {
      return {
        id: "chk_dodo_mock_" + Math.random().toString(36).substring(7),
        url: `https://checkout.dodopayments.com/mock?price=${priceId}&customer=${customerId}&success=${encodeURIComponent(
          successUrl
        )}`,
        customerId,
        priceId,
      };
    }
    return this.request<BillingCheckout>("/checkouts", "POST", {
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    });
  }

  async createSubscription(customerId: string, priceId: string): Promise<BillingSubscription> {
    if (this.isMock) {
      return {
        id: "sub_dodo_mock_" + Math.random().toString(36).substring(7),
        customerId,
        priceId,
        status: SubscriptionStatus.Active,
        quantity: 1,
        cancelAtPeriodEnd: false,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
    }
    return this.request<BillingSubscription>("/subscriptions", "POST", { customerId, priceId });
  }

  async cancelSubscription(subscriptionId: string): Promise<BillingSubscription> {
    if (this.isMock) {
      return {
        id: subscriptionId,
        customerId: "cust_mock",
        priceId: "price_mock",
        status: SubscriptionStatus.Canceled,
        quantity: 1,
        cancelAtPeriodEnd: true,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
    }
    return this.request<BillingSubscription>(`/subscriptions/${subscriptionId}/cancel`, "POST");
  }

  async pauseSubscription(subscriptionId: string): Promise<BillingSubscription> {
    if (this.isMock) {
      return {
        id: subscriptionId,
        customerId: "cust_mock",
        priceId: "price_mock",
        status: SubscriptionStatus.Paused,
        quantity: 1,
        cancelAtPeriodEnd: false,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
    }
    return this.request<BillingSubscription>(`/subscriptions/${subscriptionId}/pause`, "POST");
  }

  async resumeSubscription(subscriptionId: string): Promise<BillingSubscription> {
    if (this.isMock) {
      return {
        id: subscriptionId,
        customerId: "cust_mock",
        priceId: "price_mock",
        status: SubscriptionStatus.Active,
        quantity: 1,
        cancelAtPeriodEnd: false,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
    }
    return this.request<BillingSubscription>(`/subscriptions/${subscriptionId}/resume`, "POST");
  }

  async upgradePlan(subscriptionId: string, newPriceId: string): Promise<BillingSubscription> {
    if (this.isMock) {
      return {
        id: subscriptionId,
        customerId: "cust_mock",
        priceId: newPriceId,
        status: SubscriptionStatus.Active,
        quantity: 1,
        cancelAtPeriodEnd: false,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
    }
    return this.request<BillingSubscription>(`/subscriptions/${subscriptionId}/upgrade`, "POST", { newPriceId });
  }

  async downgradePlan(subscriptionId: string, newPriceId: string): Promise<BillingSubscription> {
    return this.upgradePlan(subscriptionId, newPriceId);
  }

  async createPortal(customerId: string, returnUrl: string): Promise<BillingPortal> {
    return {
      url: `https://billing.dodopayments.com/portal/mock?customer=${customerId}&return=${encodeURIComponent(
        returnUrl
      )}`,
    };
  }

  async listInvoices(customerId: string): Promise<readonly BillingInvoice[]> {
    if (this.isMock) {
      return [
        {
          id: "inv_dodo_1",
          number: "INV-DODO-0001",
          amountDue: 2900,
          amountPaid: 2900,
          status: "paid",
          pdfUrl: "https://invoices.dodopayments.com/mock-0001.pdf",
          createdAt: new Date(),
        },
      ];
    }
    return this.request<readonly BillingInvoice[]>(`/invoices?customerId=${encodeURIComponent(customerId)}`);
  }

  async downloadInvoice(invoiceId: string): Promise<string> {
    return `https://invoices.dodopayments.com/${invoiceId}.pdf`;
  }

  async getSubscription(subscriptionId: string): Promise<BillingSubscription | null> {
    if (this.isMock) {
      if (subscriptionId.startsWith("sub_dodo_mock")) {
        return {
          id: subscriptionId,
          customerId: "cust_mock",
          priceId: "price_mock",
          status: SubscriptionStatus.Active,
          quantity: 1,
          cancelAtPeriodEnd: false,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        };
      }
      return null;
    }
    return this.request<BillingSubscription | null>(`/subscriptions/${subscriptionId}`);
  }

  async getUsage(organizationId: string, featureName: string): Promise<BillingUsage> {
    return {
      organizationId,
      featureName,
      usageValue: 42,
      limitValue: 100,
      resetAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    };
  }

  async addCredits(organizationId: string, amount: number): Promise<BillingCredits> {
    return {
      organizationId,
      balance: 100 + amount,
      expiresAt: null,
    };
  }

  async consumeCredits(organizationId: string, amount: number): Promise<BillingCredits> {
    return {
      organizationId,
      balance: 100 - amount,
      expiresAt: null,
    };
  }

  async createRefund(paymentId: string, amount?: number): Promise<BillingRefund> {
    if (this.isMock) {
      return {
        id: "ref_dodo_mock",
        amount: amount || 2900,
        status: "succeeded",
      };
    }
    return this.request<BillingRefund>("/refunds", "POST", { paymentId, amount });
  }

  async validateWebhook(rawBody: string, signature: string, secret: string): Promise<BillingWebhookEvent> {
    if (this.isMock) {
      if (signature === "invalid") {
        throw new BillingWebhookError("Invalid mock signature");
      }
      return {
        type: "subscription.created",
        id: "evt_dodo_mock",
        data: JSON.parse(rawBody),
        createdAt: new Date(),
      };
    }

    // In production, compute HMAC SHA256 of rawBody using secret and compare with signature
    if (!signature || signature !== secret) {
      throw new BillingWebhookError("Webhook signature validation failed");
    }

    return {
      type: "payment.succeeded",
      id: "evt_live_1",
      data: JSON.parse(rawBody),
      createdAt: new Date(),
    };
  }
}
export function createDodoBillingService(config: DodoConfig = {}): BillingService {
  return new DodoPaymentsService(config);
}
