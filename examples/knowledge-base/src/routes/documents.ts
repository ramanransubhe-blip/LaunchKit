import { Router, type Request, type Response } from "express";
import { db } from "@devlaunchkit/database";
import { uploadFile } from "@devlaunchkit/storage";
import { createLogger } from "@devlaunchkit/logger";
import { generateEmbeddings } from "../services/embeddings.js";
import { summarizeDocument } from "../services/summarizer.js";
import { z } from "zod";

const router = Router();
const logger = createLogger({ service: "documents" });

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Upload and index a new document */
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const body = CreateDocumentSchema.parse(req.body);

    /** Store the raw document */
    const [document] = await db("documents")
      .insert({
        title: body.title,
        content: body.content,
        tags: JSON.stringify(body.tags ?? []),
        metadata: JSON.stringify(body.metadata ?? {}),
        user_id: userId,
        status: "processing",
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");

    /** Chunk the content for embedding */
    const chunks = chunkText(body.content, CHUNK_SIZE, CHUNK_OVERLAP);

    /** Generate embeddings for each chunk */
    const embeddings = await generateEmbeddings(chunks);

    /** Store chunks with their embeddings */
    const chunkRecords = chunks.map((text, index) => ({
      document_id: document.id,
      chunk_index: index,
      content: text,
      embedding: JSON.stringify(embeddings[index]),
      created_at: new Date(),
    }));

    await db("document_chunks").insert(chunkRecords);

    /** Generate an AI summary */
    const summary = await summarizeDocument(body.content);

    /** Upload raw content to storage as backup */
    const storageKey = `documents/${document.id}/raw.txt`;
    await uploadFile({
      key: storageKey,
      body: Buffer.from(body.content, "utf-8"),
      contentType: "text/plain",
    });

    /** Update document status */
    await db("documents").where({ id: document.id }).update({
      summary,
      chunk_count: chunks.length,
      storage_key: storageKey,
      status: "indexed",
      updated_at: new Date(),
    });

    logger.info("Document indexed", {
      documentId: document.id,
      chunks: chunks.length,
      title: body.title,
    });

    res.status(201).json({
      document: {
        id: document.id,
        title: document.title,
        summary,
        chunkCount: chunks.length,
        status: "indexed",
        createdAt: document.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    logger.error("Failed to create document", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Get a document by ID */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const document = await db("documents")
      .where({ id: req.params.id, user_id: req.user!.id })
      .first();

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json({
      document: {
        ...document,
        tags: JSON.parse(document.tags ?? "[]"),
        metadata: JSON.parse(document.metadata ?? "{}"),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch document", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Delete a document and its chunks */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const document = await db("documents")
      .where({ id: req.params.id, user_id: req.user!.id })
      .first();

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    await db("document_chunks").where({ document_id: document.id }).delete();
    await db("documents").where({ id: document.id }).delete();

    logger.info("Document deleted", { documentId: document.id });
    res.json({ message: "Document deleted", id: document.id });
  } catch (error) {
    logger.error("Failed to delete document", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Split text into overlapping chunks for embedding.
 */
function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    let chunkEnd = end;

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + size * 0.5) {
        chunkEnd = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, chunkEnd).trim());
    start = chunkEnd - overlap;

    if (start >= text.length) break;
  }

  return chunks.filter((c) => c.length > 0);
}

export { router as documentsRouter };
