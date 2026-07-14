import { Router, type Request, type Response } from "express";
import { db } from "@devlaunchkit/database";
import { getCache, setCache } from "@devlaunchkit/cache";
import { createLogger } from "@devlaunchkit/logger";
import { generateEmbeddings } from "../services/embeddings.js";
import { summarizeDocument } from "../services/summarizer.js";
import { z } from "zod";

const router = Router();
const logger = createLogger({ service: "search" });

const SearchSchema = z.object({
  query: z.string().min(1).max(1000),
  limit: z.number().int().min(1).max(50).optional().default(10),
  threshold: z.number().min(0).max(1).optional().default(0.7),
  summarize: z.boolean().optional().default(false),
});

/** Semantic search across indexed documents */
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = SearchSchema.parse(req.body);
    const userId = req.user!.id;

    /** Check cache for repeated queries */
    const cacheKey = `search:${userId}:${Buffer.from(body.query).toString("base64").slice(0, 32)}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    /** Generate embedding for the search query */
    const [queryEmbedding] = await generateEmbeddings([body.query]);

    /**
     * Perform vector similarity search using pgvector's cosine distance.
     * Joins with documents table to filter by user and return metadata.
     */
    const results = await db("document_chunks as dc")
      .join("documents as d", "dc.document_id", "d.id")
      .where("d.user_id", userId)
      .where("d.status", "indexed")
      .select(
        "dc.document_id",
        "d.title",
        "dc.chunk_index",
        "dc.content",
        db.raw(
          `1 - (dc.embedding::vector <=> '${JSON.stringify(queryEmbedding)}'::vector) as similarity`
        )
      )
      .where(
        db.raw(
          `1 - (dc.embedding::vector <=> '${JSON.stringify(queryEmbedding)}'::vector) >= ?`,
          [body.threshold]
        )
      )
      .orderBy("similarity", "desc")
      .limit(body.limit);

    /** Optionally generate an AI summary of the search results */
    let summary: string | null = null;
    if (body.summarize && results.length > 0) {
      const context = results.map((r: any) => r.content).join("\n\n---\n\n");
      summary = await summarizeDocument(
        `Based on the following context, answer the question: "${body.query}"\n\n${context}`
      );
    }

    const response = {
      query: body.query,
      results: results.map((r: any) => ({
        documentId: r.document_id,
        title: r.title,
        chunkIndex: r.chunk_index,
        content: r.content,
        similarity: parseFloat(Number(r.similarity).toFixed(4)),
      })),
      summary,
      totalResults: results.length,
      timestamp: new Date().toISOString(),
    };

    /** Cache results for 5 minutes */
    await setCache(cacheKey, JSON.stringify(response), 300);

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    logger.error("Search failed", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Autocomplete suggestions based on document titles */
router.get("/suggest", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) ?? "";
    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const userId = req.user!.id;
    const suggestions = await db("documents")
      .where("user_id", userId)
      .where("status", "indexed")
      .where("title", "ilike", `%${query}%`)
      .select("id", "title", "summary")
      .limit(5);

    res.json({ suggestions });
  } catch (error) {
    logger.error("Suggestion lookup failed", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as searchRouter };
