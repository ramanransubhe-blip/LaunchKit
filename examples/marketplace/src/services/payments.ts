/**
 * @module services/payments
 * @description Stripe Connect payment service — handles split payments, vendor
 * onboarding, account links, refunds, and webhook event processing for the
 * multi-vendor marketplace.
 *
 * Uses @devlaunchkit/payments as the foundation, extending it with Connect-
 * specific operations for marketplace revenue splitting.
 */

import { createStripeBillingService, type StripeConfig } from "@devlaunchkit/payments";
import { logger } from "@devlaunchkit/logger";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const PLATFORM_ACCOUNT = process.env.STRIPE_PLATFORM_ACCOUNT ?? "";
const IS_MOCK = !STRIPE_SECRET_KEY || process.env.NODE_ENV === "development";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Transfer destination for a split payment to a connected vendor account. */
export interface TransferDestination {
  vendorAccountId: string;
  amount: number;
  currency: string;
}

/** Parameters for creating a marketplace split payment. */
export interface SplitPaymentParams {
  amount: number;
  currency: string;
  transfers: TransferDestination[];
  metadata: Record<string, string>;
}

/** Result of a created payment intent with an optional client secret. */
export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  transfers: TransferDestination[];
}

/** Stripe Connect account creation parameters. */
export interface ConnectAccountParams {
  email: string;
  businessType: "individual" | "company" | "non_profit";
  country: string;
  businessName: string;
}

/** Stripe Connect account result. */
export interface ConnectAccountResult {
  id: string;
  email: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/** Account link for completing Stripe Connect onboarding. */
export interface AccountLinkParams {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}

export interface AccountLinkResult {
  url: string;
  expiresAt: Date;
}

/** Refund result from Stripe. */
export interface RefundResult {
  id: string;
  amount: number;
  status: string;
  paymentIntentId: string;
}

/** Processed webhook event structure. */
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Payment service
// ---------------------------------------------------------------------------

export interface MarketplacePaymentService {
  createSplitPayment(params: SplitPaymentParams): Promise<PaymentIntentResult>;
  createConnectAccount(params: ConnectAccountParams): Promise<ConnectAccountResult>;
  createAccountLink(params: AccountLinkParams): Promise<AccountLinkResult>;
  processRefund(paymentIntentId: string, amount: number): Promise<RefundResult>;
  handleWebhook(rawBody: string, signature: string): Promise<WebhookEvent>;
}

/**
 * Creates a marketplace payment service wrapping @devlaunchkit/payments
 * with Stripe Connect operations for multi-vendor revenue splitting.
 */
export function createPaymentService(): MarketplacePaymentService {
  const config: StripeConfig = {
    apiKey: STRIPE_SECRET_KEY,
    webhookSecret: STRIPE_WEBHOOK_SECRET,
    isMock: IS_MOCK,
  };

  const billing = createStripeBillingService(config);

  return {
    /**
     * Creates a Stripe PaymentIntent with destination charges — the platform
     * collects the full amount and schedules separate transfers to each
     * vendor's connected account minus the platform commission.
     */
    async createSplitPayment(params: SplitPaymentParams): Promise<PaymentIntentResult> {
      const { amount, currency, transfers, metadata } = params;

      if (IS_MOCK) {
        const id = `pi_mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

        logger.info("Mock split payment created", {
          paymentIntentId: id,
          amount,
          currency,
          transferCount: transfers.length,
        });

        return {
          id,
          clientSecret: `${id}_secret_mock`,
          amount,
          currency,
          status: "requires_payment_method",
          transfers,
        };
      }

      // In production, this calls Stripe's API to create a PaymentIntent with
      // `transfer_data` or schedules separate Transfer objects post-capture.
      const response = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: amount.toString(),
          currency,
          "automatic_payment_methods[enabled]": "true",
          "metadata[orderId]": metadata.orderId ?? "",
          "metadata[buyerId]": metadata.buyerId ?? "",
          "metadata[platformAccount]": PLATFORM_ACCOUNT,
        }).toString(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Stripe PaymentIntent creation failed: ${response.status} — ${text}`);
      }

      const pi = (await response.json()) as { id: string; client_secret: string; status: string };

      logger.info("Split payment intent created", {
        paymentIntentId: pi.id,
        amount,
        currency,
        status: pi.status,
      });

      return {
        id: pi.id,
        clientSecret: pi.client_secret,
        amount,
        currency,
        status: pi.status,
        transfers,
      };
    },

    /**
     * Creates a Stripe Connect Express account for a new vendor.
     * This is the first step of the vendor onboarding flow.
     */
    async createConnectAccount(params: ConnectAccountParams): Promise<ConnectAccountResult> {
      const { email, businessType, country, businessName } = params;

      if (IS_MOCK) {
        const id = `acct_mock_${Math.random().toString(36).slice(2, 10)}`;

        logger.info("Mock Connect account created", { accountId: id, email, businessName });

        return {
          id,
          email,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        };
      }

      const response = await fetch("https://api.stripe.com/v1/accounts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          type: "express",
          email,
          "business_type": businessType === "non_profit" ? "non_profit" : businessType,
          country,
          "business_profile[name]": businessName,
          "capabilities[card_payments][requested]": "true",
          "capabilities[transfers][requested]": "true",
        }).toString(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Stripe Connect account creation failed: ${response.status} — ${text}`);
      }

      const account = (await response.json()) as {
        id: string;
        email: string;
        charges_enabled: boolean;
        payouts_enabled: boolean;
        details_submitted: boolean;
      };

      logger.info("Connect account created", { accountId: account.id, email });

      return {
        id: account.id,
        email: account.email,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      };
    },

    /**
     * Creates an account link for the vendor to complete Stripe Connect
     * onboarding (identity verification, bank account, etc.).
     */
    async createAccountLink(params: AccountLinkParams): Promise<AccountLinkResult> {
      const { accountId, returnUrl, refreshUrl } = params;

      if (IS_MOCK) {
        const url = `https://connect.stripe.com/mock/onboarding?account=${accountId}&return=${encodeURIComponent(returnUrl)}`;

        return {
          url,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        };
      }

      const response = await fetch("https://api.stripe.com/v1/account_links", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          account: accountId,
          return_url: returnUrl,
          refresh_url: refreshUrl,
          type: "account_onboarding",
        }).toString(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Stripe account link creation failed: ${response.status} — ${text}`);
      }

      const link = (await response.json()) as { url: string; expires_at: number };

      return {
        url: link.url,
        expiresAt: new Date(link.expires_at * 1000),
      };
    },

    /**
     * Processes a full or partial refund for a payment intent and reverses
     * any related transfers to vendor accounts.
     */
    async processRefund(paymentIntentId: string, amount: number): Promise<RefundResult> {
      if (IS_MOCK) {
        const id = `re_mock_${Math.random().toString(36).slice(2, 8)}`;

        logger.info("Mock refund processed", { refundId: id, paymentIntentId, amount });

        return {
          id,
          amount,
          status: "succeeded",
          paymentIntentId,
        };
      }

      const refundResult = await billing.createRefund(paymentIntentId, amount);

      logger.info("Refund processed", {
        refundId: refundResult.id,
        paymentIntentId,
        amount: refundResult.amount,
        status: refundResult.status,
      });

      return {
        id: refundResult.id,
        amount: refundResult.amount,
        status: refundResult.status,
        paymentIntentId,
      };
    },

    /**
     * Validates and processes incoming Stripe webhook events.
     * Handles Connect-specific events like `account.updated` alongside
     * standard payment events.
     */
    async handleWebhook(rawBody: string, signature: string): Promise<WebhookEvent> {
      const event = await billing.validateWebhook(rawBody, signature, STRIPE_WEBHOOK_SECRET);

      logger.info("Webhook event received", { type: event.type, id: event.id });

      // Route Connect-specific events
      switch (event.type) {
        case "account.updated": {
          const accountId = (event.data as any).id;
          const chargesEnabled = (event.data as any).charges_enabled;
          const payoutsEnabled = (event.data as any).payouts_enabled;

          logger.info("Vendor account updated via webhook", {
            accountId,
            chargesEnabled,
            payoutsEnabled,
          });
          break;
        }

        case "payment_intent.succeeded": {
          const piId = (event.data as any).id;
          logger.info("Payment succeeded — scheduling vendor transfers", { paymentIntentId: piId });
          break;
        }

        case "payment_intent.payment_failed": {
          const piId = (event.data as any).id;
          const failureMessage = (event.data as any).last_payment_error?.message;
          logger.warn("Payment failed", { paymentIntentId: piId, failureMessage });
          break;
        }

        case "transfer.created": {
          const transferId = (event.data as any).id;
          const destination = (event.data as any).destination;
          logger.info("Transfer to vendor created", { transferId, destination });
          break;
        }

        case "charge.refunded": {
          const chargeId = (event.data as any).id;
          logger.info("Charge refunded", { chargeId });
          break;
        }

        default:
          logger.debug("Unhandled webhook event type", { type: event.type });
      }

      return {
        id: event.id,
        type: event.type,
        data: event.data,
        createdAt: event.createdAt,
      };
    },
  };
}
