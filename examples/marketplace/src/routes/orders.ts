/**
 * @module routes/orders
 * @description Order management routes — placement, status tracking, refunds,
 * and Stripe Connect split-payment processing.
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

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100),
  unitPrice: z.number().positive(),
  vendorId: z.string().min(1),
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1).max(50),
  shippingAddress: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    country: z.string().length(2),
  }),
  currency: z.enum(["usd", "eur", "gbp"]).default("usd"),
});

const UpdateStatusSchema = z.object({
  status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface OrderItem {
  productId: string;
  vendorId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  currency: string;
  subtotal: number;
  platformFee: number;
  total: number;
  status: OrderStatus;
  paymentIntentId: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// In-memory order store
// ---------------------------------------------------------------------------

const orderStore = new Map<string, Order>();
const paymentService = createPaymentService();

function generateOrderId(): string {
  return `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Notification helpers
// ---------------------------------------------------------------------------

/**
 * Sends an order notification to the buyer and relevant vendors.
 * In production this calls @devlaunchkit/notifications with templated
 * emails and optional push notifications.
 */
async function sendOrderNotification(
  order: Order,
  event: "placed" | "paid" | "shipped" | "delivered" | "refunded",
): Promise<void> {
  const subjectMap: Record<string, string> = {
    placed: `Order ${order.id} — Confirmation`,
    paid: `Order ${order.id} — Payment Received`,
    shipped: `Order ${order.id} — Shipped`,
    delivered: `Order ${order.id} — Delivered`,
    refunded: `Order ${order.id} — Refund Processed`,
  };

  logger.info("Order notification dispatched", {
    orderId: order.id,
    event,
    subject: subjectMap[event],
    buyerId: order.buyerId,
    vendorIds: [...new Set(order.items.map((i) => i.vendorId))],
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const ordersRouter = new Hono<AppContext>();

/**
 * GET /api/orders
 * Authenticated — list orders. Buyers see their own; vendors see items sold.
 */
ordersRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");

  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const page = parseInt(c.req.query("page") ?? "1", 10);
  const limit = parseInt(c.req.query("limit") ?? "20", 10);

  let orders = Array.from(orderStore.values());

  if (role === "vendor" && vendorId) {
    // Vendors see orders containing their products
    orders = orders.filter((o) => o.items.some((i) => i.vendorId === vendorId));
  } else if (role === "buyer") {
    orders = orders.filter((o) => o.buyerId === userId);
  }
  // Admins see all orders

  orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = orders.length;
  const paginated = orders.slice((page - 1) * limit, page * limit);

  return c.json({ orders: paginated, total, page, limit, totalPages: Math.ceil(total / limit) });
});

/**
 * GET /api/orders/:id
 * Authenticated — get a single order's details.
 */
ordersRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");
  const orderId = c.req.param("id");

  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const order = orderStore.get(orderId);
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  // Access control
  const isBuyer = order.buyerId === userId;
  const isVendor = role === "vendor" && order.items.some((i) => i.vendorId === vendorId);
  const isAdmin = role === "admin";

  if (!isBuyer && !isVendor && !isAdmin) {
    return c.json({ error: "Access denied" }, 403);
  }

  return c.json({ order });
});

/**
 * POST /api/orders
 * Buyer only — place a new order, creating a Stripe Connect payment intent
 * with automatic revenue splits to each vendor.
 */
ordersRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");

  if (!userId || role === "anonymous") {
    return c.json({ error: "Authentication required" }, 401);
  }

  const body = await c.req.json();
  const validated = CreateOrderSchema.parse(body);

  // Check instant-checkout feature flag
  const instantCheckout = await featureFlags.evaluate("marketplace.instant-checkout", {
    userId,
    environment: process.env.NODE_ENV,
  });

  // Calculate order totals
  const items: OrderItem[] = validated.items.map((item) => ({
    productId: item.productId,
    vendorId: item.vendorId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.quantity * item.unitPrice,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const commissionRate = parseFloat(process.env.STRIPE_COMMISSION_RATE ?? "10") / 100;
  const platformFee = Math.round(subtotal * commissionRate);
  const total = subtotal;

  // Group items by vendor for split payments
  const vendorSplits = new Map<string, number>();
  for (const item of items) {
    const current = vendorSplits.get(item.vendorId) ?? 0;
    vendorSplits.set(item.vendorId, current + item.subtotal);
  }

  // Create payment intent with splits via Stripe Connect
  const transfers = Array.from(vendorSplits.entries()).map(([vendorId, amount]) => ({
    vendorAccountId: `acct_${vendorId}`,
    amount: Math.round(amount * (1 - commissionRate)),
    currency: validated.currency,
  }));

  const paymentIntent = await paymentService.createSplitPayment({
    amount: total,
    currency: validated.currency,
    transfers,
    metadata: {
      orderId: "",
      buyerId: userId,
    },
  });

  const order: Order = {
    id: generateOrderId(),
    buyerId: userId,
    items,
    shippingAddress: validated.shippingAddress,
    currency: validated.currency,
    subtotal,
    platformFee,
    total,
    status: instantCheckout ? "paid" : "pending",
    paymentIntentId: paymentIntent.id,
    trackingNumber: null,
    trackingUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  orderStore.set(order.id, order);

  await sendOrderNotification(order, "placed");

  logger.info("Order placed", {
    orderId: order.id,
    buyerId: userId,
    total,
    vendorCount: vendorSplits.size,
    instantCheckout,
  });

  return c.json(
    {
      order,
      clientSecret: paymentIntent.clientSecret,
      instantCheckout,
    },
    201,
  );
});

/**
 * PUT /api/orders/:id/status
 * Vendor only — update the order status (ship, deliver, etc.).
 */
ordersRouter.put("/:id/status", async (c) => {
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");
  const orderId = c.req.param("id");

  if (role !== "vendor" && role !== "admin") {
    return c.json({ error: "Insufficient permissions" }, 403);
  }

  const order = orderStore.get(orderId);
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  if (role === "vendor" && !order.items.some((i) => i.vendorId === vendorId)) {
    return c.json({ error: "You do not have items in this order" }, 403);
  }

  const body = await c.req.json();
  const validated = UpdateStatusSchema.parse(body);

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    pending: ["processing", "cancelled"],
    paid: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
  };

  const allowed = validTransitions[order.status] ?? [];
  if (!allowed.includes(validated.status)) {
    return c.json(
      { error: `Cannot transition from '${order.status}' to '${validated.status}'` },
      400,
    );
  }

  order.status = validated.status;
  order.updatedAt = new Date();

  if (validated.trackingNumber) order.trackingNumber = validated.trackingNumber;
  if (validated.trackingUrl) order.trackingUrl = validated.trackingUrl;

  orderStore.set(orderId, order);

  const notificationEvent = validated.status === "shipped" ? "shipped" : "delivered";
  await sendOrderNotification(order, notificationEvent);

  logger.info("Order status updated", { orderId, newStatus: validated.status, vendorId });
  return c.json({ order });
});

/**
 * POST /api/orders/:id/refund
 * Buyer or Admin — request or process a refund for an order.
 */
ordersRouter.post("/:id/refund", async (c) => {
  const userId = c.get("userId");
  const role = c.get("userRole");
  const orderId = c.req.param("id");

  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const order = orderStore.get(orderId);
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  if (role !== "admin" && order.buyerId !== userId) {
    return c.json({ error: "Only the buyer or an admin can request a refund" }, 403);
  }

  if (order.status === "refunded" || order.status === "cancelled") {
    return c.json({ error: "Order has already been refunded or cancelled" }, 400);
  }

  if (!order.paymentIntentId) {
    return c.json({ error: "No payment found for this order" }, 400);
  }

  // Process refund through Stripe Connect
  const refund = await paymentService.processRefund(order.paymentIntentId, order.total);

  order.status = "refunded";
  order.updatedAt = new Date();
  orderStore.set(orderId, order);

  await sendOrderNotification(order, "refunded");

  logger.info("Order refunded", { orderId, refundId: refund.id, amount: order.total });
  return c.json({ order, refund });
});

/**
 * GET /api/orders/:id/tracking
 * Buyer — get shipment tracking information.
 */
ordersRouter.get("/:id/tracking", async (c) => {
  const userId = c.get("userId");
  const orderId = c.req.param("id");

  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const order = orderStore.get(orderId);
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  if (order.buyerId !== userId && c.get("userRole") !== "admin") {
    return c.json({ error: "Access denied" }, 403);
  }

  if (!order.trackingNumber) {
    return c.json({ error: "Tracking information not yet available" }, 404);
  }

  return c.json({
    orderId: order.id,
    status: order.status,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  });
});
