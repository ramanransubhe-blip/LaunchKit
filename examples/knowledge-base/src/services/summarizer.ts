import { createAIClient } from "@devlaunchkit/ai";
import { createLogger } from "@devlaunchkit/logger";

const logger = createLogger({ service: "summarizer" });
const ai = createAIClient({ provider: "anthropic" });

const SUMMARIZATION_MODEL = "claude-sonnet-4-20250514";
const MAX_INPUT_LENGTH = 100_000;

/**
 * Generate a concise summary of a document or query-scoped context
 * using Anthropic's Claude model.
 *
 * @param content - The text content to summarize
 * @param maxTokens - Maximum tokens for the summary (default: 500)
 * @returns The generated summary string
 */
export async function summarizeDocument(content: string, maxTokens: number = 500): Promise<string> {
  if (!content || content.trim().length === 0) {
    return "";
  }

  /** Truncate extremely long documents to stay within context limits */
  const truncated =
    content.length > MAX_INPUT_LENGTH
      ? content.slice(0, MAX_INPUT_LENGTH) + "\n\n[Content truncated for summarization]"
      : content;

  try {
    const response = await ai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: [
            "You are a knowledge base assistant that creates clear, accurate summaries.",
            "Summarize the provided content in a concise paragraph.",
            "Focus on key facts, concepts, and actionable information.",
            "Do not add opinions or information not present in the source material.",
            "If the content is a question with context, provide a direct answer based on the context.",
          ].join(" "),
        },
        {
          role: "user",
          content: truncated,
        },
      ],
    });

    const summary = response.choices?.[0]?.message?.content?.trim() ?? "";

    logger.info("Document summarized", {
      inputLength: content.length,
      outputLength: summary.length,
      truncated: content.length > MAX_INPUT_LENGTH,
    });

    return summary;
  } catch (error) {
    logger.error("Summarization failed", { error });
    throw error;
  }
}
