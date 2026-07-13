/**
 * @module routes/chat
 * @description Chat completion & conversation management routes.
 *
 * Provides endpoints for streaming AI chat completions, managing conversation
 * history, and enforcing per-tier rate limits with credit consumption.
 */

import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

import {
  getGlobalAIService,
  type AIMessage,
  type AIOptions,
  type AIService,
} from "@devlaunchkit/ai";
import { sendSuccess, sendFailure, sendPagination } from "@devlaunchkit/api";
import { RateLimiter, type RateLimitResult } from "@devlaunchkit/rate-limit";

import { getLimiterForTier, type SubscriptionTier } from "../index.js";
import type { AuthEnv } from "../middleware/auth.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Stored conversation record. */
interface Conversation {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly model: string;
  readonly messages: AIMessage[];
  readonly totalTokens: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Request body for the chat completions endpoint. */
interface ChatCompletionRequest {
  readonly conversationId?: string;
  readonly message: string;
  readonly model?: string;
  readonly stream?: boolean;
  readonly systemPrompt?: string;
}

// ---------------------------------------------------------------------------
// In-Memory Store (swap with @devlaunchkit/database in production)
// ---------------------------------------------------------------------------

const conversations = new Map<string, Conversation>();

/**
 * Generates a short unique identifier for new conversations.
 * Uses crypto-quality randomness for collision resistance.
 */
function generateId(): string {
  return `conv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Credit Limits per Tier
// ---------------------------------------------------------------------------

/** Maximum monthly token allowance per subscription tier. */
const TIER_TOKEN_LIMITS: Record<SubscriptionTier, number> = {
  free: 50_000,
  pro: 1_000_000,
  enterprise: 10_000_000,
};

/** Monthly token usage tracked per user (in production, use the database). */
const monthlyUsage = new Map<string, number>();

/**
 * Checks whether a user has sufficient token credits remaining.
 *
 * @param userId - The user's unique identifier.
 * @param tier - The user's subscription tier.
 * @returns True if the user can make additional requests.
 */
function hasTokenBudget(userId: string, tier: SubscriptionTier): boolean {
  const used = monthlyUsage.get(userId) ?? 0;
  return used < TIER_TOKEN_LIMITS[tier];
}

/**
 * Records token consumption for a user.
 *
 * @param userId - The user's unique identifier.
 * @param tokens - Number of tokens consumed in this request.
 */
function recordTokenUsage(userId: string, tokens: number): void {
  const current = monthlyUsage.get(userId) ?? 0;
  monthlyUsage.set(userId, current + tokens);
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const chatRouter = new Hono<AuthEnv>();

/**
 * POST /completions
 *
 * Sends a user message to the configured AI provider and returns either a
 * streamed SSE response or a complete JSON response based on the `stream`
 * parameter. Automatically persists the conversation history.
 */
chatRouter.post("/completions", async (c) => {
  const { user, tier } = c.get("userContext");

  // --- Rate Limit Check ---
  const limiter = getLimiterForTier(tier);
  const rateLimitKey = `chat:${user.id}`;
  const rlResult: RateLimitResult = await limiter.check(rateLimitKey);

  if (!rlResult.allowed) {
    c.header("X-RateLimit-Limit", String(rlResult.limit));
    c.header("X-RateLimit-Remaining", "0");
    c.header("X-RateLimit-Reset", String(rlResult.resetSeconds));
    c.header("Retry-After", String(rlResult.retryAfterSeconds));
    return c.json(
      sendFailure("Rate limit exceeded. Please try again later.", "RATE_LIMITED"),
      429,
    );
  }

  // --- Token Budget Check ---
  if (!hasTokenBudget(user.id, tier as SubscriptionTier)) {
    return c.json(
      sendFailure(
        "Monthly token quota exhausted. Upgrade your plan for additional capacity.",
        "QUOTA_EXCEEDED",
      ),
      402,
    );
  }

  // --- Parse & Validate Request Body ---
  const body = await c.req.json<ChatCompletionRequest>();

  if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
    return c.json(sendFailure("Message is required", "VALIDATION_ERROR"), 400);
  }

  if (body.message.length > 32_000) {
    return c.json(sendFailure("Message exceeds maximum length of 32,000 characters", "VALIDATION_ERROR"), 400);
  }

  // --- Resolve or Create Conversation ---
  let conversation: Conversation;
  if (body.conversationId && conversations.has(body.conversationId)) {
    conversation = conversations.get(body.conversationId)!;

    // Verify ownership
    if (conversation.userId !== user.id) {
      return c.json(sendFailure("Conversation not found", "NOT_FOUND"), 404);
    }
  } else {
    conversation = {
      id: generateId(),
      userId: user.id,
      title: body.message.slice(0, 80),
      model: body.model ?? "gpt-4o",
      messages: [],
      totalTokens: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Append system prompt on first message if provided
  const messages: AIMessage[] = [...conversation.messages];
  if (messages.length === 0 && body.systemPrompt) {
    messages.push({ role: "system", content: body.systemPrompt });
  }
  messages.push({ role: "user", content: body.message.trim() });

  const aiOptions: AIOptions = {
    model: body.model ?? conversation.model,
    temperature: 0.7,
    maxTokens: tier === "enterprise" ? 8192 : tier === "pro" ? 4096 : 2048,
  };

  const ai: AIService = getGlobalAIService();

  // --- Streaming Response ---
  if (body.stream !== false) {
    return streamSSE(c, async (stream) => {
      try {
        const readable = await ai.streamText(
          messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
          aiOptions,
        );

        const reader = readable.getReader();
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          fullText += value.text;
          await stream.writeSSE({
            event: "token",
            data: JSON.stringify({ text: value.text, done: value.done }),
          });
        }

        // Persist the completed exchange
        messages.push({ role: "assistant", content: fullText });
        const estimatedTokens = Math.ceil(fullText.length / 4);
        const updatedConversation: Conversation = {
          ...conversation,
          messages,
          totalTokens: conversation.totalTokens + estimatedTokens,
          updatedAt: new Date(),
        };
        conversations.set(updatedConversation.id, updatedConversation);
        recordTokenUsage(user.id, estimatedTokens);

        await stream.writeSSE({
          event: "done",
          data: JSON.stringify({
            conversationId: updatedConversation.id,
            tokensUsed: estimatedTokens,
          }),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream failed";
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify({ error: message }),
        });
      }
    });
  }

  // --- Non-Streaming Response ---
  try {
    const result = await ai.chat(messages, aiOptions);
    messages.push(result.message);

    const updatedConversation: Conversation = {
      ...conversation,
      messages,
      totalTokens: conversation.totalTokens + result.usage.totalTokens,
      updatedAt: new Date(),
    };
    conversations.set(updatedConversation.id, updatedConversation);
    recordTokenUsage(user.id, result.usage.totalTokens);

    c.header("X-RateLimit-Remaining", String(rlResult.remaining));
    return c.json(
      sendSuccess({
        conversationId: updatedConversation.id,
        message: result.message,
        model: result.model,
        usage: result.usage,
        cost: result.cost,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat completion failed";
    return c.json(sendFailure(message, "AI_ERROR"), 500);
  }
});

/**
 * GET /conversations
 *
 * Lists all conversations for the authenticated user with pagination.
 */
chatRouter.get("/conversations", async (c) => {
  const { user } = c.get("userContext");
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = Math.min(parseInt(c.req.query("pageSize") ?? "20", 10), 100);

  const userConversations = Array.from(conversations.values())
    .filter((conv) => conv.userId === user.id)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const totalItems = userConversations.length;
  const start = (page - 1) * pageSize;
  const paginated = userConversations.slice(start, start + pageSize).map((conv) => ({
    id: conv.id,
    title: conv.title,
    model: conv.model,
    messageCount: conv.messages.length,
    totalTokens: conv.totalTokens,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
  }));

  return c.json(sendPagination(paginated, page, pageSize, totalItems));
});

/**
 * GET /conversations/:id
 *
 * Returns a single conversation with its full message history.
 */
chatRouter.get("/conversations/:id", async (c) => {
  const { user } = c.get("userContext");
  const conversationId = c.req.param("id");

  const conversation = conversations.get(conversationId);
  if (!conversation || conversation.userId !== user.id) {
    return c.json(sendFailure("Conversation not found", "NOT_FOUND"), 404);
  }

  return c.json(sendSuccess({
    id: conversation.id,
    title: conversation.title,
    model: conversation.model,
    messages: conversation.messages,
    totalTokens: conversation.totalTokens,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  }));
});

/**
 * DELETE /conversations/:id
 *
 * Permanently deletes a conversation and its message history.
 */
chatRouter.delete("/conversations/:id", async (c) => {
  const { user } = c.get("userContext");
  const conversationId = c.req.param("id");

  const conversation = conversations.get(conversationId);
  if (!conversation || conversation.userId !== user.id) {
    return c.json(sendFailure("Conversation not found", "NOT_FOUND"), 404);
  }

  conversations.delete(conversationId);
  return c.json(sendSuccess({ deleted: true }));
});
