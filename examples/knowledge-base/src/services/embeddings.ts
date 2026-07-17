import { createAIClient } from "@devlaunchkit/ai";
import { createLogger } from "@devlaunchkit/logger";

const logger = createLogger({ service: "embeddings" });
const ai = createAIClient({ provider: "openai" });

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 100;

/**
 * Generate vector embeddings for an array of text chunks.
 * Batches requests to stay within API limits.
 *
 * @param texts - Array of text strings to embed
 * @returns Array of embedding vectors (number arrays)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE);

    try {
      const response = await ai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
        dimensions: EMBEDDING_DIMENSIONS,
      });

      const batchEmbeddings = response.data.map((item: { embedding: number[] }) => item.embedding);
      embeddings.push(...batchEmbeddings);

      logger.debug("Embedding batch processed", {
        batchIndex: Math.floor(i / MAX_BATCH_SIZE),
        batchSize: batch.length,
        totalProcessed: embeddings.length,
      });
    } catch (error) {
      logger.error("Embedding generation failed", {
        batchIndex: Math.floor(i / MAX_BATCH_SIZE),
        error,
      });
      throw error;
    }
  }

  return embeddings;
}

/**
 * Compute cosine similarity between two embedding vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimensionality");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
