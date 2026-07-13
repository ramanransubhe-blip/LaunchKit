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

export interface GeminiConfig {
  apiKey?: string;
  isMock?: boolean;
}

export class GeminiService implements AIService {
  readonly providerName = "gemini";
  private readonly apiKey: string;
  private readonly isMock: boolean;

  constructor(config: GeminiConfig = {}) {
    this.apiKey = config.apiKey || "";
    this.isMock = config.isMock ?? true;
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    if (this.isMock) {
      throw new AIProviderError("Direct API calls disabled in mock mode.");
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models${path}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new AIProviderError(`Gemini API request failed: ${response.status} — ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(
        `Failed to complete Gemini request: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateText(prompt: string, options?: AIOptions): Promise<AITextResult> {
    if (this.isMock) {
      return {
        text: `[Gemini Mock Response] Completed prompt: "${prompt}"`,
        model: options?.model || "gemini-1.5-flash",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        cost: 0.0001,
      };
    }

    const modelName = options?.model || "gemini-1.5-flash";
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const res = await this.request<any>(`/${modelName}:generateContent`, payload);
    return {
      text: res.candidates[0].content.parts[0].text,
      model: modelName,
      usage: {
        promptTokens: res.usageMetadata?.promptTokenCount || 0,
        completionTokens: res.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: res.usageMetadata?.totalTokenCount || 0,
      },
      cost: (res.usageMetadata?.totalTokenCount || 0) * 0.000005,
    };
  }

  async streamText(prompt: string, options?: AIOptions): Promise<ReadableStream<AITextChunk>> {
    const text = `[Gemini Mock Stream] Completed prompt: "${prompt}"`;
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
    return {
      object: { result: `Gemini Mock output matching schema`, prompt } as unknown as T,
      model: options?.model || "gemini-1.5-flash",
      usage: { promptTokens: 15, completionTokens: 10, totalTokens: 25 },
      cost: 0.0002,
    };
  }

  async chat(messages: readonly AIMessage[], options?: AIOptions): Promise<AIChatResult> {
    if (this.isMock) {
      return {
        message: { role: "assistant", content: `[Gemini Mock Chat Response]` },
        model: options?.model || "gemini-1.5-flash",
        usage: { promptTokens: 15, completionTokens: 15, totalTokens: 30 },
        cost: 0.00015,
      };
    }

    const modelName = options?.model || "gemini-1.5-flash";
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await this.request<any>(`/${modelName}:generateContent`, { contents });
    return {
      message: {
        role: "assistant",
        content: res.candidates[0].content.parts[0].text,
      },
      model: modelName,
      usage: {
        promptTokens: res.usageMetadata?.promptTokenCount || 0,
        completionTokens: res.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: res.usageMetadata?.totalTokenCount || 0,
      },
      cost: (res.usageMetadata?.totalTokenCount || 0) * 0.000005,
    };
  }

  async embed(text: string, options?: AIOptions): Promise<AIEmbeddingResult> {
    return {
      embedding: Array.from({ length: 768 }, () => Math.random()),
      model: options?.model || "text-embedding-004",
    };
  }

  async summarize(text: string, options?: AIOptions): Promise<AITextResult> {
    return this.generateText(`Summarize this text: ${text}`, options);
  }

  async classify(text: string, categories: readonly string[], options?: AIOptions): Promise<AIClassifyResult> {
    return {
      category: categories[0] || "unknown",
      confidence: 0.90,
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
    return {
      flagged: false,
      categories: { hate: false, violence: false },
    };
  }

  async transcribe(audioBuffer: Buffer, options?: AIOptions): Promise<AITranscribeResult> {
    return { text: "[Gemini Mock Audio Transcription result]" };
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

export function createGeminiService(config: GeminiConfig = {}): AIService {
  return new GeminiService(config);
}
