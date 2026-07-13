export interface AIMessage {
  readonly role: "system" | "user" | "assistant" | "tool";
  readonly content: string;
  readonly name?: string;
}

export interface AIOptions {
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly systemPrompt?: string;
  readonly jsonMode?: boolean;
}

export interface AITokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface AITextResult {
  readonly text: string;
  readonly model: string;
  readonly usage: AITokenUsage;
  readonly cost: number; // in USD
}

export interface AITextChunk {
  readonly text: string;
  readonly done: boolean;
}

export interface AIObjectResult<T> {
  readonly object: T;
  readonly model: string;
  readonly usage: AITokenUsage;
  readonly cost: number;
}

export interface AIChatResult {
  readonly message: AIMessage;
  readonly model: string;
  readonly usage: AITokenUsage;
  readonly cost: number;
}

export interface AIEmbeddingResult {
  readonly embedding: readonly number[];
  readonly model: string;
}

export interface AIClassifyResult {
  readonly category: string;
  readonly confidence: number;
}

export interface AIModerationResult {
  readonly flagged: boolean;
  readonly categories: Record<string, boolean>;
}

export interface AITranscribeResult {
  readonly text: string;
}

// Reusable provider-independent AIService contract
export interface AIService {
  readonly providerName: string;

  generateText(prompt: string, options?: AIOptions): Promise<AITextResult>;
  streamText(prompt: string, options?: AIOptions): Promise<ReadableStream<AITextChunk>>;
  generateObject<T>(prompt: string, schema: any, options?: AIOptions): Promise<AIObjectResult<T>>;
  chat(messages: readonly AIMessage[], options?: AIOptions): Promise<AIChatResult>;
  embed(text: string, options?: AIOptions): Promise<AIEmbeddingResult>;
  summarize(text: string, options?: AIOptions): Promise<AITextResult>;
  classify(text: string, categories: readonly string[], options?: AIOptions): Promise<AIClassifyResult>;
  rewrite(text: string, instruction: string, options?: AIOptions): Promise<AITextResult>;
  translate(text: string, targetLanguage: string, options?: AIOptions): Promise<AITextResult>;
  extract(text: string, schema: any, options?: AIOptions): Promise<AIObjectResult<any>>;
  moderate(text: string, options?: AIOptions): Promise<AIModerationResult>;
  transcribe(audioBuffer: Buffer, options?: AIOptions): Promise<AITranscribeResult>;
  generateTitle(prompt: string, options?: AIOptions): Promise<string>;
  generateTags(prompt: string, options?: AIOptions): Promise<readonly string[]>;
}
