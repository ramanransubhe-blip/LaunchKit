import { db } from "@devlaunchkit/database";
import { createLogger } from "@devlaunchkit/logger";
import { generateEmbeddings } from "../services/embeddings.js";

const logger = createLogger({ service: "indexer-worker" });

/**
 * Background indexer worker.
 * Polls for documents in "pending" status and generates embeddings for them.
 * Useful for bulk import scenarios where documents are uploaded without
 * immediate indexing.
 */
async function processNextDocument(): Promise<boolean> {
  const document = await db("documents")
    .where({ status: "pending" })
    .orderBy("created_at", "asc")
    .first();

  if (!document) {
    return false;
  }

  logger.info("Processing document", { documentId: document.id, title: document.title });

  try {
    await db("documents")
      .where({ id: document.id })
      .update({ status: "processing", updated_at: new Date() });

    /** Chunk the document content */
    const chunks = chunkText(document.content, 1000, 200);

    /** Generate embeddings */
    const embeddings = await generateEmbeddings(chunks);

    /** Store chunks with embeddings */
    const records = chunks.map((text, index) => ({
      document_id: document.id,
      chunk_index: index,
      content: text,
      embedding: JSON.stringify(embeddings[index]),
      created_at: new Date(),
    }));

    /** Remove any existing chunks (re-index case) */
    await db("document_chunks").where({ document_id: document.id }).delete();
    await db("document_chunks").insert(records);

    /** Mark as indexed */
    await db("documents")
      .where({ id: document.id })
      .update({
        status: "indexed",
        chunk_count: chunks.length,
        updated_at: new Date(),
      });

    logger.info("Document indexed", {
      documentId: document.id,
      chunks: chunks.length,
    });

    return true;
  } catch (error) {
    logger.error("Document indexing failed", { documentId: document.id, error });

    await db("documents")
      .where({ id: document.id })
      .update({
        status: "failed",
        updated_at: new Date(),
      });

    return false;
  }
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks.filter((c) => c.length > 0);
}

/** Worker loop — polls every 5 seconds for pending documents */
const POLL_INTERVAL_MS = 5000;

async function main(): Promise<void> {
  logger.info("Indexer worker started", { pollIntervalMs: POLL_INTERVAL_MS });

  const tick = async () => {
    let processed = true;
    while (processed) {
      processed = await processNextDocument();
    }
  };

  await tick();
  setInterval(tick, POLL_INTERVAL_MS);
}

main().catch((error) => {
  logger.error("Indexer worker crashed", { error });
  process.exit(1);
});
