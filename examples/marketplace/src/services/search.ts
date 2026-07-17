/**
 * @module services/search
 * @description Product search service wrapping @devlaunchkit/search with
 * Algolia indexing and querying for the marketplace. Supports full-text search,
 * faceted filtering, and relevance-ranked results.
 */

import { logger } from "@devlaunchkit/logger";
import { cache } from "@devlaunchkit/cache";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID ?? "";
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY ?? "";
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? "products";
const IS_MOCK = !ALGOLIA_APP_ID || process.env.NODE_ENV === "development";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Product record stored in the search index. */
export interface IndexedProduct {
  objectID: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  vendorId: string;
  vendorName?: string;
  imageUrl?: string;
  inventory: number;
  rating?: number;
  createdAt: string;
}

/** Query options for product search. */
export interface SearchOptions {
  page?: number;
  hitsPerPage?: number;
  filters?: Record<string, string>;
  facets?: string[];
}

/** A single search result hit. */
export interface SearchHit {
  objectID: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  vendorId: string;
  imageUrl?: string;
  highlightedTitle?: string;
  highlightedDescription?: string;
}

/** Search response containing hits, facets, and pagination metadata. */
export interface SearchResponse {
  hits: SearchHit[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
  facets?: Record<string, Record<string, number>>;
  query: string;
}

// ---------------------------------------------------------------------------
// In-memory search index (mock replacement for Algolia)
// ---------------------------------------------------------------------------

const memoryIndex = new Map<string, IndexedProduct>();

/**
 * Simple in-memory full-text search scoring. Matches terms in title,
 * description, tags, and category with weighted relevance.
 */
function scoreProduct(product: IndexedProduct, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;

  for (const term of terms) {
    const titleLower = product.title.toLowerCase();
    const descLower = product.description.toLowerCase();
    const categoryLower = product.category.toLowerCase();

    if (titleLower.includes(term)) score += 10;
    if (titleLower.startsWith(term)) score += 5;
    if (descLower.includes(term)) score += 3;
    if (categoryLower.includes(term)) score += 7;
    if (product.tags.some((t) => t.toLowerCase().includes(term))) score += 5;
  }

  return score;
}

/**
 * Highlights matching terms within text by wrapping them in `<em>` tags.
 */
function highlightText(text: string, query: string): string {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let result = text;

  for (const term of terms) {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    result = result.replace(regex, "<em>$1</em>");
  }

  return result;
}

// ---------------------------------------------------------------------------
// Search service
// ---------------------------------------------------------------------------

export interface ProductSearchService {
  initialize(): Promise<void>;
  indexProduct(product: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    tags: string[];
    vendorId: string;
    images?: Array<{ url: string }>;
    inventory: number;
    createdAt: Date;
  }): Promise<void>;
  removeProduct(productId: string): Promise<void>;
  searchProducts(query: string, options?: SearchOptions): Promise<SearchResponse>;
  reindexAll(
    products: Array<{
      id: string;
      title: string;
      description: string;
      price: number;
      currency: string;
      category: string;
      tags: string[];
      vendorId: string;
      images?: Array<{ url: string }>;
      inventory: number;
      createdAt: Date;
    }>
  ): Promise<void>;
}

/**
 * Creates a product search service backed by Algolia in production or an
 * in-memory index in development mode.
 */
export function createSearchService(): ProductSearchService {
  return {
    /**
     * Initializes the search service and configures index settings.
     * In production, this sets Algolia searchable attributes, ranking,
     * and faceting configuration.
     */
    async initialize(): Promise<void> {
      if (IS_MOCK) {
        logger.info("Search service initialized in mock mode (in-memory index)");
        return;
      }

      // Configure Algolia index settings
      const settingsResponse = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/settings`,
        {
          method: "PUT",
          headers: {
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "X-Algolia-API-Key": ALGOLIA_ADMIN_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            searchableAttributes: ["title", "description", "category", "tags", "vendorName"],
            attributesForFaceting: [
              "searchable(category)",
              "searchable(tags)",
              "vendorId",
              "filterOnly(price)",
              "filterOnly(inventory)",
            ],
            customRanking: ["desc(rating)", "desc(inventory)"],
            hitsPerPage: 20,
          }),
        }
      );

      if (!settingsResponse.ok) {
        const text = await settingsResponse.text();
        logger.error("Failed to configure Algolia index settings", { error: text });
        throw new Error(`Algolia settings update failed: ${settingsResponse.status}`);
      }

      logger.info("Search service initialized with Algolia", { indexName: ALGOLIA_INDEX_NAME });
    },

    /**
     * Indexes a single product in the search engine for discoverability.
     */
    async indexProduct(product): Promise<void> {
      const doc: IndexedProduct = {
        objectID: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        category: product.category,
        tags: product.tags,
        vendorId: product.vendorId,
        imageUrl: product.images?.[0]?.url,
        inventory: product.inventory,
        createdAt: product.createdAt.toISOString(),
      };

      if (IS_MOCK) {
        memoryIndex.set(doc.objectID, doc);
        logger.debug("Product indexed in memory", { productId: doc.objectID });
        return;
      }

      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${doc.objectID}`,
        {
          method: "PUT",
          headers: {
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "X-Algolia-API-Key": ALGOLIA_ADMIN_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(doc),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Algolia indexing failed for product ${doc.objectID}: ${text}`);
      }

      logger.debug("Product indexed in Algolia", { productId: doc.objectID });
    },

    /**
     * Removes a product from the search index (e.g., on soft-delete).
     */
    async removeProduct(productId: string): Promise<void> {
      if (IS_MOCK) {
        memoryIndex.delete(productId);
        logger.debug("Product removed from memory index", { productId });
        return;
      }

      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${productId}`,
        {
          method: "DELETE",
          headers: {
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "X-Algolia-API-Key": ALGOLIA_ADMIN_KEY,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Algolia deletion failed for product ${productId}: ${text}`);
      }

      logger.debug("Product removed from Algolia", { productId });
    },

    /**
     * Performs a full-text search across products with optional faceted
     * filtering and pagination.
     */
    async searchProducts(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
      const start = performance.now();
      const page = options.page ?? 1;
      const hitsPerPage = options.hitsPerPage ?? 20;

      if (IS_MOCK) {
        let results = Array.from(memoryIndex.values())
          .map((product) => ({ product, score: scoreProduct(product, query) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score);

        // Apply facet filters
        if (options.filters) {
          if (options.filters.category) {
            results = results.filter(
              ({ product }) => product.category === options.filters!.category
            );
          }
          if (options.filters.vendorId) {
            results = results.filter(
              ({ product }) => product.vendorId === options.filters!.vendorId
            );
          }
        }

        const totalHits = results.length;
        const offset = (page - 1) * hitsPerPage;
        const paginatedResults = results.slice(offset, offset + hitsPerPage);

        // Build facets
        const allResults = Array.from(memoryIndex.values());
        const categoryFacets: Record<string, number> = {};
        for (const p of allResults) {
          categoryFacets[p.category] = (categoryFacets[p.category] ?? 0) + 1;
        }

        const hits: SearchHit[] = paginatedResults.map(({ product }) => ({
          objectID: product.objectID,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          category: product.category,
          tags: product.tags,
          vendorId: product.vendorId,
          imageUrl: product.imageUrl,
          highlightedTitle: highlightText(product.title, query),
          highlightedDescription: highlightText(product.description, query),
        }));

        const elapsed = Math.round(performance.now() - start);

        return {
          hits,
          totalHits,
          page,
          totalPages: Math.ceil(totalHits / hitsPerPage),
          processingTimeMs: elapsed,
          facets: { category: categoryFacets },
          query,
        };
      }

      // Build Algolia filter string from structured filters
      let filterParts: string[] = [];
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          filterParts.push(`${key}:${value}`);
        }
      }

      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/query`,
        {
          method: "POST",
          headers: {
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "X-Algolia-API-Key": ALGOLIA_ADMIN_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            page: page - 1,
            hitsPerPage,
            filters: filterParts.join(" AND "),
            facets: options.facets ?? ["category", "tags"],
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Algolia search failed: ${text}`);
      }

      const data = (await response.json()) as {
        hits: Array<IndexedProduct & { _highlightResult?: any }>;
        nbHits: number;
        page: number;
        nbPages: number;
        processingTimeMS: number;
        facets?: Record<string, Record<string, number>>;
      };

      const elapsed = Math.round(performance.now() - start);

      const hits: SearchHit[] = data.hits.map((hit) => ({
        objectID: hit.objectID,
        title: hit.title,
        description: hit.description,
        price: hit.price,
        currency: hit.currency,
        category: hit.category,
        tags: hit.tags,
        vendorId: hit.vendorId,
        imageUrl: hit.imageUrl,
        highlightedTitle: hit._highlightResult?.title?.value,
        highlightedDescription: hit._highlightResult?.description?.value,
      }));

      return {
        hits,
        totalHits: data.nbHits,
        page: data.page + 1,
        totalPages: data.nbPages,
        processingTimeMs: elapsed,
        facets: data.facets,
        query,
      };
    },

    /**
     * Bulk re-indexes all products. Used during initial setup or when
     * rebuilding the search index from the database.
     */
    async reindexAll(products): Promise<void> {
      logger.info("Starting full product reindex", { count: products.length });

      const batchSize = 100;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await Promise.all(
          batch.map((product) =>
            this.indexProduct(product).catch((err) => {
              logger.error("Failed to index product during reindex", {
                productId: product.id,
                error: String(err),
              });
            })
          )
        );
        logger.debug("Reindex batch complete", {
          processed: Math.min(i + batchSize, products.length),
          total: products.length,
        });
      }

      logger.info("Full product reindex complete", { indexed: products.length });
    },
  };
}
