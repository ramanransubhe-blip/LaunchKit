/**
 * @module routes/vendors
 * @description Vendor registration, Stripe Connect onboarding, profile
 * management, payout history, and analytics routes.
 */

import { Hono } from "hono";
import { z } from "zod";
import { logger } from "@devlaunchkit/logger";
import { featureFlags } from "@devlaunchkit/feature-flags";
import { createPaymentService } from "../services/payments.js";
import type { AppContext } from "../index.js";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const RegisterVendorSchema = z.object({
  businessName: z.string().min(2).max(200),
  businessType: z.enum(["individual", "company", "non_profit"]),
  email: z.string().email(),
  country: z.string().length(2),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  categories: z.array(z.string().max(50)).max(10).default([]),
});

const UpdateVendorSchema = z.object({
  businessName: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  categories: z.array(z.string().max(50)).max(10).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OnboardingStatus = "pending" | "in_progress" | "complete" | "rejected";

interface Vendor {
  id: string;
  userId: string;
  stripeAccountId: string | null;
  businessName: string;
  businessType: "individual" | "company" | "non_profit";
  email: string;
  country: string;
  description: string;
  website: string | null;
  categories: string[];
  logoUrl: string | null;
  bannerUrl: string | null;
  onboardingStatus: OnboardingStatus;
  isActive: boolean;
  totalRevenue: number;
  totalOrders: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: "pending" | "in_transit" | "paid" | "failed";
  arrivalDate: Date;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

const vendorStore = new Map<string, Vendor>();
const payoutStore = new Map<string, VendorPayout[]>();
const paymentService = createPaymentService();

function generateVendorId(): string {
  return `vnd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const vendorsRouter = new Hono<AppContext>();

/**
 * POST /api/vendors/register
 * Authenticated — register a new vendor account with Stripe Connect.
 */
vendorsRouter.post("/register", async (c) => {
  const userId = c.get("userId");

  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  // Check if user is already a vendor
  const existing = Array.from(vendorStore.values()).find((v) => v.userId === userId);
  if (existing) {
    return c.json({ error: "You are already registered as a vendor", vendorId: existing.id }, 409);
  }

  const body = await c.req.json();
  const validated = RegisterVendorSchema.parse(body);

  // Create a Stripe Connect Express account for this vendor
  const stripeAccount = await paymentService.createConnectAccount({
    email: validated.email,
    businessType: validated.businessType,
    country: validated.country,
    businessName: validated.businessName,
  });

  const vendor: Vendor = {
    id: generateVendorId(),
    userId,
    stripeAccountId: stripeAccount.id,
    businessName: validated.businessName,
    businessType: validated.businessType,
    email: validated.email,
    country: validated.country,
    description: validated.description ?? "",
    website: validated.website ?? null,
    categories: validated.categories,
    logoUrl: null,
    bannerUrl: null,
    onboardingStatus: "pending",
    isActive: false,
    totalRevenue: 0,
    totalOrders: 0,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  vendorStore.set(vendor.id, vendor);

  logger.info("Vendor registered", {
    vendorId: vendor.id,
    userId,
    stripeAccountId: stripeAccount.id,
    businessName: vendor.businessName,
  });

  return c.json({ vendor }, 201);
});

/**
 * GET /api/vendors/me
 * Vendor only — get current vendor profile and aggregate stats.
 */
vendorsRouter.get("/me", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");

  if (!userId || role !== "vendor") {
    return c.json({ error: "Vendor access required" }, 403);
  }

  const vendor = Array.from(vendorStore.values()).find((v) => v.userId === userId);
  if (!vendor) {
    return c.json({ error: "Vendor profile not found" }, 404);
  }

  return c.json({
    vendor,
    stats: {
      totalRevenue: vendor.totalRevenue,
      totalOrders: vendor.totalOrders,
      averageRating: vendor.rating,
      onboardingComplete: vendor.onboardingStatus === "complete",
    },
  });
});

/**
 * PUT /api/vendors/me
 * Vendor only — update vendor profile details.
 */
vendorsRouter.put("/me", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");

  if (!userId || role !== "vendor") {
    return c.json({ error: "Vendor access required" }, 403);
  }

  const vendor = Array.from(vendorStore.values()).find((v) => v.userId === userId);
  if (!vendor) {
    return c.json({ error: "Vendor profile not found" }, 404);
  }

  const body = await c.req.json();
  const validated = UpdateVendorSchema.parse(body);

  if (validated.businessName) vendor.businessName = validated.businessName;
  if (validated.description !== undefined) vendor.description = validated.description;
  if (validated.website !== undefined) vendor.website = validated.website ?? null;
  if (validated.categories) vendor.categories = validated.categories;
  if (validated.logoUrl !== undefined) vendor.logoUrl = validated.logoUrl ?? null;
  if (validated.bannerUrl !== undefined) vendor.bannerUrl = validated.bannerUrl ?? null;
  vendor.updatedAt = new Date();

  vendorStore.set(vendor.id, vendor);

  logger.info("Vendor profile updated", { vendorId: vendor.id, userId });
  return c.json({ vendor });
});

/**
 * POST /api/vendors/onboard
 * Vendor only — generate a Stripe Connect onboarding link.
 * The vendor completes identity verification, bank account setup, etc.
 */
vendorsRouter.post("/onboard", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");

  if (!userId || role !== "vendor") {
    return c.json({ error: "Vendor access required" }, 403);
  }

  const vendor = Array.from(vendorStore.values()).find((v) => v.userId === userId);
  if (!vendor) {
    return c.json({ error: "Vendor profile not found" }, 404);
  }

  if (!vendor.stripeAccountId) {
    return c.json({ error: "No Stripe account linked. Please re-register." }, 400);
  }

  if (vendor.onboardingStatus === "complete") {
    return c.json({ error: "Onboarding already completed" }, 400);
  }

  const returnUrl = `${c.req.header("origin") ?? "http://localhost:3000"}/vendor/onboard/complete`;
  const refreshUrl = `${c.req.header("origin") ?? "http://localhost:3000"}/vendor/onboard/refresh`;

  const accountLink = await paymentService.createAccountLink({
    accountId: vendor.stripeAccountId,
    returnUrl,
    refreshUrl,
  });

  vendor.onboardingStatus = "in_progress";
  vendor.updatedAt = new Date();
  vendorStore.set(vendor.id, vendor);

  logger.info("Vendor onboarding link generated", {
    vendorId: vendor.id,
    stripeAccountId: vendor.stripeAccountId,
  });

  return c.json({
    onboardingUrl: accountLink.url,
    expiresAt: accountLink.expiresAt,
  });
});

/**
 * GET /api/vendors/me/payouts
 * Vendor only — list payout history with status and amounts.
 */
vendorsRouter.get("/me/payouts", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");

  if (!userId || role !== "vendor") {
    return c.json({ error: "Vendor access required" }, 403);
  }

  const vendor = Array.from(vendorStore.values()).find((v) => v.userId === userId);
  if (!vendor) {
    return c.json({ error: "Vendor profile not found" }, 404);
  }

  // In production, fetch from Stripe Connect API
  const payouts: VendorPayout[] = payoutStore.get(vendor.id) ?? [
    {
      id: `po_${Math.random().toString(36).slice(2, 8)}`,
      vendorId: vendor.id,
      amount: 45000,
      currency: "usd",
      status: "paid",
      arrivalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      id: `po_${Math.random().toString(36).slice(2, 8)}`,
      vendorId: vendor.id,
      amount: 32500,
      currency: "usd",
      status: "in_transit",
      arrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts
    .filter((p) => p.status !== "paid" && p.status !== "failed")
    .reduce((s, p) => s + p.amount, 0);

  return c.json({
    payouts,
    summary: {
      totalPaid,
      totalPending,
      currency: "usd",
    },
  });
});

/**
 * GET /api/vendors/me/analytics
 * Vendor only — revenue analytics, top products, and sales trends.
 * Gated behind the `marketplace.vendor-analytics-v2` feature flag.
 */
vendorsRouter.get("/me/analytics", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");

  if (!userId || role !== "vendor") {
    return c.json({ error: "Vendor access required" }, 403);
  }

  const vendor = Array.from(vendorStore.values()).find((v) => v.userId === userId);
  if (!vendor) {
    return c.json({ error: "Vendor profile not found" }, 404);
  }

  const useV2 = await featureFlags.evaluate("marketplace.vendor-analytics-v2", {
    userId,
    environment: process.env.NODE_ENV,
  });

  // Base analytics available to all vendors
  const baseAnalytics = {
    revenue: {
      total: vendor.totalRevenue,
      thisMonth: Math.round(vendor.totalRevenue * 0.15),
      lastMonth: Math.round(vendor.totalRevenue * 0.12),
      growthPercent: 25.0,
    },
    orders: {
      total: vendor.totalOrders,
      thisMonth: Math.round(vendor.totalOrders * 0.15),
      averageOrderValue:
        vendor.totalOrders > 0 ? Math.round(vendor.totalRevenue / vendor.totalOrders) : 0,
    },
    topProducts: [
      { productId: "prod_sample_1", title: "Premium Widget", revenue: 15000, unitsSold: 50 },
      { productId: "prod_sample_2", title: "Deluxe Gadget", revenue: 12000, unitsSold: 30 },
      { productId: "prod_sample_3", title: "Standard Thingamajig", revenue: 8000, unitsSold: 80 },
    ],
  };

  if (!useV2) {
    return c.json({ analytics: baseAnalytics, version: "v1" });
  }

  // Enhanced V2 analytics with additional insights
  const enhancedAnalytics = {
    ...baseAnalytics,
    conversionFunnel: {
      views: 12500,
      addToCart: 3200,
      checkout: 1800,
      purchased: 1500,
      conversionRate: 12.0,
    },
    customerInsights: {
      repeatCustomerRate: 35.2,
      averageLifetimeValue: 245.0,
      topRegions: [
        { region: "US-CA", orders: 450, revenue: 67500 },
        { region: "US-NY", orders: 320, revenue: 48000 },
        { region: "GB", orders: 180, revenue: 27000 },
      ],
    },
    trends: {
      dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        revenue: Math.round(Math.random() * 5000 + 1000),
        orders: Math.round(Math.random() * 20 + 5),
      })),
    },
  };

  return c.json({ analytics: enhancedAnalytics, version: "v2" });
});
