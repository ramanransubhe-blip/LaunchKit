/**
 * @module services/search
 * @description Full-text search service for CRM entities.
 *
 * Provides an in-memory search index that supports tokenized full-text
 * matching across contacts, deals, and companies. In production, replace
 * with Algolia or MeiliSearch via `@devlaunchkit/search`.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported entity types that can be indexed. */
export type SearchableEntity = "contact" | "deal" | "company";

/** A single indexed document in the search corpus. */
export interface SearchDocument {
  readonly id: string;
  readonly entityType: SearchableEntity;
  readonly orgId: string;
  /** Searchable text fields concatenated for full-text matching. */
  readonly searchableText: string;
  /** Original data payload returned in search results. */
  readonly data: Record<string, unknown>;
  readonly indexedAt: Date;
}

/** A ranked search result with relevance scoring. */
export interface SearchResult {
  readonly document: SearchDocument;
  /** Relevance score from 0.0 to 1.0. */
  readonly score: number;
  /** Highlighted matching fragments. */
  readonly highlights: readonly string[];
}

/** Options for controlling search behavior. */
export interface SearchOptions {
  readonly entityType?: SearchableEntity;
  readonly limit?: number;
  readonly offset?: number;
}

// ---------------------------------------------------------------------------
// Search Index Implementation
// ---------------------------------------------------------------------------

/**
 * In-memory full-text search index with TF-IDF-inspired scoring.
 *
 * @remarks
 * This implementation is suitable for development and small datasets.
 * For production, integrate with `@devlaunchkit/search` which provides
 * Algolia and MeiliSearch adapters with real-time indexing.
 */
class CrmSearchIndex {
  private documents = new Map<string, SearchDocument>();

  /**
   * Adds or updates a document in the search index.
   *
   * @param doc - The document to index.
   */
  index(doc: SearchDocument): void {
    this.documents.set(`${doc.entityType}:${doc.id}`, doc);
  }

  /**
   * Removes a document from the search index.
   *
   * @param entityType - The type of entity to remove.
   * @param id - The entity's unique identifier.
   */
  remove(entityType: SearchableEntity, id: string): void {
    this.documents.delete(`${entityType}:${id}`);
  }

  /**
   * Performs a full-text search across indexed documents.
   *
   * @param query - The search query string.
   * @param orgId - Organization scope for multi-tenant isolation.
   * @param options - Search configuration options.
   * @returns Ranked search results ordered by relevance.
   */
  search(query: string, orgId: string, options: SearchOptions = {}): SearchResult[] {
    const { entityType, limit = 20, offset = 0 } = options;

    if (!query.trim()) {
      return [];
    }

    const queryTokens = this.tokenize(query);
    const results: SearchResult[] = [];

    for (const doc of this.documents.values()) {
      // Multi-tenant isolation — only search within the user's organization
      if (doc.orgId !== orgId) continue;

      // Entity type filter
      if (entityType && doc.entityType !== entityType) continue;

      const { score, highlights } = this.scoreDocument(doc, queryTokens);
      if (score > 0) {
        results.push({ document: doc, score, highlights });
      }
    }

    // Sort by relevance score (descending), then by recency
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.document.indexedAt.getTime() - a.document.indexedAt.getTime();
    });

    return results.slice(offset, offset + limit);
  }

  /**
   * Returns the total number of documents matching a search query.
   *
   * @param query - The search query string.
   * @param orgId - Organization scope.
   * @param entityType - Optional entity type filter.
   * @returns Total matching document count.
   */
  count(query: string, orgId: string, entityType?: SearchableEntity): number {
    if (!query.trim()) return 0;

    const queryTokens = this.tokenize(query);
    let count = 0;

    for (const doc of this.documents.values()) {
      if (doc.orgId !== orgId) continue;
      if (entityType && doc.entityType !== entityType) continue;

      const { score } = this.scoreDocument(doc, queryTokens);
      if (score > 0) count++;
    }

    return count;
  }

  /**
   * Tokenizes a string into normalized lowercase terms.
   *
   * @param text - The text to tokenize.
   * @returns Array of normalized tokens.
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s@.-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1);
  }

  /**
   * Scores a document against query tokens using term frequency matching.
   *
   * @param doc - The document to score.
   * @param queryTokens - Normalized query tokens.
   * @returns Score and highlighted matching fragments.
   */
  private scoreDocument(
    doc: SearchDocument,
    queryTokens: string[],
  ): { score: number; highlights: string[] } {
    const docText = doc.searchableText.toLowerCase();
    const docTokens = this.tokenize(doc.searchableText);
    let score = 0;
    const highlights: string[] = [];

    for (const qt of queryTokens) {
      // Exact token match — highest score
      const exactMatches = docTokens.filter((dt) => dt === qt).length;
      score += exactMatches * 1.0;

      // Prefix match — partial score
      const prefixMatches = docTokens.filter((dt) => dt.startsWith(qt) && dt !== qt).length;
      score += prefixMatches * 0.5;

      // Substring containment — lowest score
      if (docText.includes(qt) && exactMatches === 0 && prefixMatches === 0) {
        score += 0.25;
      }

      // Extract highlight fragments (surrounding context)
      const idx = docText.indexOf(qt);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(docText.length, idx + qt.length + 30);
        const fragment = doc.searchableText.slice(start, end).trim();
        highlights.push(start > 0 ? `...${fragment}...` : `${fragment}...`);
      }
    }

    // Normalize score relative to the number of query tokens
    const normalizedScore = queryTokens.length > 0 ? score / queryTokens.length : 0;
    return {
      score: Math.min(normalizedScore, 1.0),
      highlights: highlights.slice(0, 3),
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton & Helper Functions
// ---------------------------------------------------------------------------

/** Global CRM search index instance. */
export const searchIndex = new CrmSearchIndex();

/**
 * Indexes a contact record for full-text search.
 *
 * @param contact - The contact to index.
 * @param orgId - The owning organization.
 */
export function indexContact(
  contact: { id: string; name: string; email: string; company?: string; phone?: string; notes?: string },
  orgId: string,
): void {
  const searchableText = [
    contact.name,
    contact.email,
    contact.company ?? "",
    contact.phone ?? "",
    contact.notes ?? "",
  ].join(" ");

  searchIndex.index({
    id: contact.id,
    entityType: "contact",
    orgId,
    searchableText,
    data: contact,
    indexedAt: new Date(),
  });
}

/**
 * Indexes a deal record for full-text search.
 *
 * @param deal - The deal to index.
 * @param orgId - The owning organization.
 */
export function indexDeal(
  deal: { id: string; title: string; contactName?: string; company?: string; notes?: string },
  orgId: string,
): void {
  const searchableText = [
    deal.title,
    deal.contactName ?? "",
    deal.company ?? "",
    deal.notes ?? "",
  ].join(" ");

  searchIndex.index({
    id: deal.id,
    entityType: "deal",
    orgId,
    searchableText,
    data: deal,
    indexedAt: new Date(),
  });
}

export default searchIndex;
