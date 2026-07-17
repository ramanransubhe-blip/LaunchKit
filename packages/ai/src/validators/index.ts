import { z } from "zod";

export const optionsSchema = z
  .object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
    systemPrompt: z.string().optional(),
    jsonMode: z.boolean().optional(),
  })
  .optional();

export const generateTextSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  options: optionsSchema,
});

export const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string().min(1, "Message content cannot be empty"),
  name: z.string().optional(),
});

export const chatSchema = z.object({
  messages: z.array(messageSchema).min(1, "At least one message is required"),
  options: optionsSchema,
});

export const embedSchema = z.object({
  text: z.string().min(1, "Text to embed cannot be empty"),
  options: optionsSchema,
});

export const summarizeSchema = z.object({
  text: z.string().min(1, "Text to summarize cannot be empty"),
  options: optionsSchema,
});

export const classifySchema = z.object({
  text: z.string().min(1, "Text to classify cannot be empty"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  options: optionsSchema,
});

export const moderateSchema = z.object({
  text: z.string().min(1, "Text to moderate cannot be empty"),
  options: optionsSchema,
});

export function validatePayload<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `AI payload validation failed: ${result.error.errors.map((e) => e.message).join(", ")}`
    );
  }
  return result.data;
}

export type GenerateTextInput = z.infer<typeof generateTextSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type EmbedInput = z.infer<typeof embedSchema>;
export type SummarizeInput = z.infer<typeof summarizeSchema>;
export type ClassifyInput = z.infer<typeof classifySchema>;
export type ModerateInput = z.infer<typeof moderateSchema>;
