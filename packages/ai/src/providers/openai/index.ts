import type {
  AIService,
  AITextResult,
  AITextChunk,
  AIObjectResult,
  AIChatResult,
  AIEmbeddingResult,
  AIClassifyResult,
  AIModerationResult,
  AITranscribeResult,
  AIMessage,
  AIOptions,
} from "../../core/contracts.js";
import { AIProviderError } from "../../core/errors.js";

export interface OpenAIConfig {
  apiKey?: string;
  isMock?: boolean;
}

export class OpenAIService implements AIService {
  readonly providerName = "openai";
  private readonly apiKey: string;
  private readonly isMock: boolean;

  constructor(config: OpenAIConfig = {}) {
    this.apiKey = config.apiKey || "";
    this.isMock = config.isMock ?? true; // Defaults to mock mode for testing/safety
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    if (this.isMock) {
      throw new AIProviderError("Direct API calls disabled in mock mode.");
    }
    try {
      const response = await fetch(`https://api.openai.com/v1${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new AIProviderError(`OpenAI API request failed: ${response.status} — ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(
        `Failed to complete OpenAI request: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateText(prompt: string, options?: AIOptions): Promise<AITextResult> {
    if (this.isMock) {
      return {
        text: `[OpenAI Mock Response] Completed prompt: "${prompt}"`,
        model: options?.model || "gpt-4o",
        usage: { promptTokens: 12, completionTokens: 8, totalTokens: 20 },
        cost: 0.0003,
      };
    }

    const payload = {
      model: options?.model || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
    };

    const res = await this.request<any>("/chat/completions", payload);
    return {
      text: res.choices[0].message.content,
      model: payload.model,
      usage: {
        promptTokens: res.usage.prompt_tokens,
        completionTokens: res.usage.completion_tokens,
        totalTokens: res.usage.total_tokens,
      },
      cost: res.usage.total_tokens * 0.000015,
    };
  }

  async streamText(prompt: string, options?: AIOptions): Promise<ReadableStream<AITextChunk>> {
    const text = `[OpenAI Mock Stream] Completed prompt: "${prompt}"`;
    const chunks = text.split(" ").map((word) => word + " ");

    return new ReadableStream<AITextChunk>({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue({ text: chunk, done: false });
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        controller.enqueue({ text: "", done: true });
        controller.close();
      },
    });
  }

  async generateObject<T>(prompt: string, schema: any, options?: AIOptions): Promise<AIObjectResult<T>> {
    if (this.isMock) {
      // Return a basic mock structure conforming to simple JSON outputs
      return {
        object: { result: `Mock output matching schema`, prompt } as unknown as T,
        model: options?.model || "gpt-4o",
        usage: { promptTokens: 15, completionTokens: 10, totalTokens: 25 },
        cost: 0.0004,
      };
    }

    const res = await this.generateText(prompt, { ...options, jsonMode: true });
    return {
      object: JSON.parse(res.text) as T,
      model: res.model,
      usage: res.usage,
      cost: res.cost,
    };
  }

  async chat(messages: readonly AIMessage[], options?: AIOptions): Promise<AIChatResult> {
    if (this.isMock) {
      return {
        message: { role: "assistant", content: `[OpenAI Mock Chat Response]` },
        model: options?.model || "gpt-4o",
        usage: { promptTokens: 20, completionTokens: 12, totalTokens: 32 },
        cost: 0.0005,
      };
    }

    const payload = {
      model: options?.model || "gpt-4o",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
    };

    const res = await this.request<any>("/chat/completions", payload);
    return {
      message: {
        role: "assistant",
        content: res.choices[0].message.content,
      },
      model: payload.model,
      usage: {
        promptTokens: res.usage.prompt_tokens,
        completionTokens: res.usage.completion_tokens,
        totalTokens: res.usage.total_tokens,
      },
      cost: res.usage.total_tokens * 0.000015,
    };
  }

  async embed(text: string, options?: AIOptions): Promise<AIEmbeddingResult> {
    if (this.isMock) {
      return {
        embedding: Array.from({ length: 1536 }, () => Math.random()),
        model: options?.model || "text-embedding-3-small",
      };
    }

    const payload = {
      model: options?.model || "text-embedding-3-small",
      input: text,
    };

    const res = await this.request<any>("/embeddings", payload);
    return {
      embedding: res.data[0].embedding,
      model: payload.model,
    };
  }

  async summarize(text: string, options?: AIOptions): Promise<AITextResult> {
    return this.generateText(`Summarize this text: ${text}`, options);
  }

  async classify(text: string, categories: readonly string[], options?: AIOptions): Promise<AIClassifyResult> {
    return {
      category: categories[0] || "unknown",
      confidence: 0.95,
    };
  }

  async rewrite(text: string, instruction: string, options?: AIOptions): Promise<AITextResult> {
    return this.generateText(`Rewrite this text: "${text}" following this instruction: "${instruction}"`, options);
  }

  async translate(text: string, targetLanguage: string, options?: AIOptions): Promise<AITextResult> {
    return this.generateText(`Translate this text: "${text}" into language: ${targetLanguage}`, options);
  }

  async extract(text: string, schema: any, options?: AIOptions): Promise<AIObjectResult<any>> {
    return this.generateObject(text, schema, options);
  }

  async moderate(text: string, options?: AIOptions): Promise<AIModerationResult> {
    if (this.isMock) {
      return {
        flagged: false,
        categories: { hate: false, violence: false },
      };
    }
    const res = await this.request<any>("/moderations", { input: text });
    return {
      flagged: res.results[0].flagged,
      categories: res.results[0].categories,
    };
  }

  async transcribe(audioBuffer: Buffer, options?: AIOptions): Promise<AITranscribeResult> {
    return { text: "[OpenAI Mock Audio Transcription result]" };
  }

  async generateTitle(prompt: string, options?: AIOptions): Promise<string> {
    const res = await this.generateText(`Generate a short, title of less than 6 words summarizing this prompt: "${prompt}"`, options);
    return res.text.replace(/["']/g, "").trim();
  }

  async generateTags(prompt: string, options?: AIOptions): Promise<readonly string[]> {
    const res = await this.generateText(`Generate a comma-separated list of tags for: "${prompt}"`, options);
    return res.text.split(",").map((t) => t.trim().toLowerCase());
  }
}

export function createOpenAIService(config: OpenAIConfig = {}): AIService {
  return new OpenAIService(config);
}
