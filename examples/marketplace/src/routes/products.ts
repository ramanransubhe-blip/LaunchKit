/**
 * @module routes/products
 * @description Product CRUD routes with image uploads, search integration,
 * and feature-flag-gated capabilities for the marketplace.
 */

import { Hono } from "hono";
import { z } from "zod";
import { logger } from "@devlaunchkit/logger";
import { cache } from "@devlaunchkit/cache";
import { featureFlags } from "@devlaunchkit/feature-flags";
import { createSearchService } from "../services/search.js";
import type { AppContext } from "../index.js";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const CreateProductSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive().max(999999),
  currency: z.enum(["usd", "eur", "gbp"]).default("usd"),
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(20).default([]),
  inventory: z.number().int().nonneg().default(0),
  isActive: z.boolean().default(true),
});

const UpdateProductSchema = CreateProductSchema.partial();

const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonneg().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  vendorId: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "popular"]).default("newest"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Product {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  inventory: number;
  isActive: boolean;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// In-memory product store (replaced by @devlaunchkit/database in production)
// ---------------------------------------------------------------------------

const productStore = new Map<string, Product>();

function generateId(): string {
  return `prod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const productsRouter = new Hono<AppContext>();
const searchService = createSearchService();

/**
 * GET /api/products
 * Public — list products with filtering, sorting, and pagination.
 */
productsRouter.get("/", async (c) => {
  const raw = Object.fromEntries(new URL(c.req.url).searchParams);
  const query = ListQuerySchema.parse(raw);

  const cacheKey = `products:list:${JSON.stringify(query)}`;
  const cached = await cache.get<{ products: Product[]; total: number }>(cacheKey);
  if (cached) {
    logger.debug("Products list cache hit", { cacheKey });
    return c.json(cached);
  }

  let products = Array.from(productStore.values()).filter((p) => p.isActive);

  // Apply filters
  if (query.category) {
    products = products.filter((p) => p.category === query.category);
  }
  if (query.minPrice !== undefined) {
    products = products.filter((p) => p.price >= query.minPrice!);
  }
  if (query.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= query.maxPrice!);
  }
  if (query.vendorId) {
    products = products.filter((p) => p.vendorId === query.vendorId);
  }

  // Sort
  switch (query.sort) {
    case "price_asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "popular":
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
  }

  // Paginate
  const total = products.length;
  const offset = (query.page - 1) * query.limit;
  const paginated = products.slice(offset, offset + query.limit);

  const result = {
    products: paginated,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };

  await cache.set(cacheKey, result, 30);
  return c.json(result);
});

/**
 * GET /api/products/search
 * Public — full-text search powered by Algolia / vector index.
 */
productsRouter.get("/search", async (c) => {
  const q = c.req.query("q") ?? "";
  const category = c.req.query("category");
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const limit = parseInt(c.req.query("limit") ?? "20", 10);

  if (!q.trim()) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const cacheKey = `products:search:${q}:${category ?? "all"}:${page}:${limit}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(cached);
  }

  const filters: Record<string, string> = {};
  if (category) filters.category = category;

  const results = await searchService.searchProducts(q, { page, hitsPerPage: limit, filters });

  await cache.set(cacheKey, results, 15);
  return c.json(results);
});

/**
 * GET /api/products/:id
 * Public — retrieve a single product by ID.
 */
productsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const product = productStore.get(id);

  if (!product || !product.isActive) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json({ product });
});

/**
 * POST /api/products
 * Vendor only — create a new product listing.
 */
productsRouter.post("/", async (c) => {
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");

  if (role !== "vendor" || !vendorId) {
    return c.json({ error: "Only vendors can create products" }, 403);
  }

  const body = await c.req.json();
  const validated = CreateProductSchema.parse(body);

  // Check multi-currency feature flag
  if (validated.currency !== "usd") {
    const multiCurrencyEnabled = await featureFlags.evaluate("marketplace.multi-currency", {
      userId: c.get("userId") ?? undefined,
      environment: process.env.NODE_ENV,
    });

    if (!multiCurrencyEnabled) {
      return c.json({ error: "Multi-currency is not yet available for your account" }, 403);
    }
  }

  const now = new Date();
  const product: Product = {
    id: generateId(),
    vendorId,
    title: validated.title,
    description: validated.description,
    price: validated.price,
    currency: validated.currency,
    category: validated.category,
    tags: validated.tags,
    inventory: validated.inventory,
    isActive: validated.isActive,
    images: [],
    createdAt: now,
    updatedAt: now,
  };

  productStore.set(product.id, product);

  // Index in search engine asynchronously
  searchService.indexProduct(product).catch((err) => {
    logger.error("Failed to index product in search", { productId: product.id, error: String(err) });
  });

  // Invalidate list caches
  await cache.invalidateByTags(["products:list"]);

  logger.info("Product created", { productId: product.id, vendorId, title: product.title });
  return c.json({ product }, 201);
});

/**
 * PUT /api/products/:id
 * Vendor only (owner) — update an existing product.
 */
productsRouter.put("/:id", async (c) => {
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");
  const id = c.req.param("id");

  if (role !== "vendor" && role !== "admin") {
    return c.json({ error: "Insufficient permissions" }, 403);
  }

  const product = productStore.get(id);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  if (role === "vendor" && product.vendorId !== vendorId) {
    return c.json({ error: "You can only update your own products" }, 403);
  }

  const body = await c.req.json();
  const validated = UpdateProductSchema.parse(body);

  const updated: Product = {
    ...product,
    ...validated,
    updatedAt: new Date(),
  };

  productStore.set(id, updated);

  // Re-index in search
  searchService.indexProduct(updated).catch((err) => {
    logger.error("Failed to re-index product", { productId: id, error: String(err) });
  });

  await cache.invalidateByTags(["products:list"]);
  await cache.delete(`products:detail:${id}`);

  logger.info("Product updated", { productId: id, vendorId });
  return c.json({ product: updated });
});

/**
 * DELETE /api/products/:id
 * Vendor only (owner) — soft-delete a product.
 */
productsRouter.delete("/:id", async (c) => {
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");
  const id = c.req.param("id");

  if (role !== "vendor" && role !== "admin") {
    return c.json({ error: "Insufficient permissions" }, 403);
  }

  const product = productStore.get(id);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  if (role === "vendor" && product.vendorId !== vendorId) {
    return c.json({ error: "You can only delete your own products" }, 403);
  }

  // Soft-delete
  product.isActive = false;
  product.updatedAt = new Date();
  productStore.set(id, product);

  // Remove from search index
  searchService.removeProduct(id).catch((err) => {
    logger.error("Failed to remove product from search index", { productId: id, error: String(err) });
  });

  await cache.invalidateByTags(["products:list"]);
  await cache.delete(`products:detail:${id}`);

  logger.info("Product soft-deleted", { productId: id, vendorId });
  return c.json({ success: true });
});

/**
 * POST /api/products/:id/images
 * Vendor only (owner) — upload images for a product.
 * Expects multipart/form-data with one or more `image` fields.
 */
productsRouter.post("/:id/images", async (c) => {
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");
  const id = c.req.param("id");

  if (role !== "vendor") {
    return c.json({ error: "Only vendors can upload product images" }, 403);
  }

  const product = productStore.get(id);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  if (product.vendorId !== vendorId) {
    return c.json({ error: "You can only manage your own products" }, 403);
  }

  // In production this streams through @devlaunchkit/storage with signed
  // upload URLs. Here we simulate the upload result.
  const formData = await c.req.formData();
  const files = formData.getAll("image");

  if (files.length === 0) {
    return c.json({ error: "At least one image file is required" }, 400);
  }

  const newImages: ProductImage[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    const imageId = `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const storagePath = `vendors/${vendorId}/products/${id}/${imageId}_${file.name}`;

    // Simulate @devlaunchkit/storage upload
    const uploadResult = {
      path: storagePath,
      url: `https://cdn.marketplace.app/${storagePath}`,
      size: file.size,
    };

    const image: ProductImage = {
      id: imageId,
      url: uploadResult.url,
      alt: product.title,
      sortOrder: product.images.length + newImages.length,
    };

    newImages.push(image);
    logger.debug("Product image uploaded", { productId: id, imageId, path: uploadResult.path });
  }

  product.images.push(...newImages);
  product.updatedAt = new Date();
  productStore.set(id, product);

  logger.info("Product images uploaded", { productId: id, count: newImages.length });
  return c.json({ images: newImages }, 201);
});

/**
 * DELETE /api/products/:id/images/:imageId
 * Vendor only (owner) — remove a specific image from a product.
 */
productsRouter.delete("/:id/images/:imageId", async (c) => {
  const role = c.get("userRole");
  const vendorId = c.get("vendorId");
  const productId = c.req.param("id");
  const imageId = c.req.param("imageId");

  if (role !== "vendor") {
    return c.json({ error: "Only vendors can manage product images" }, 403);
  }

  const product = productStore.get(productId);
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  if (product.vendorId !== vendorId) {
    return c.json({ error: "You can only manage your own products" }, 403);
  }

  const imageIndex = product.images.findIndex((img) => img.id === imageId);
  if (imageIndex === -1) {
    return c.json({ error: "Image not found" }, 404);
  }

  const [removed] = product.images.splice(imageIndex, 1);
  product.updatedAt = new Date();
  productStore.set(productId, product);

  // In production: await storageService.delete(bucket, removed.url);
  logger.info("Product image removed", { productId, imageId: removed.id });
  return c.json({ success: true });
});
