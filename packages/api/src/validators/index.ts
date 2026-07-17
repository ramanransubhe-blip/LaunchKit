import { z } from "zod";

export const apiKeySchema = z.object({
  name: z.string().min(1, "Name is required"),
  scopes: z.array(z.string()).min(1, "At least one scope is required"),
  expiresInDays: z.number().int().positive().optional(),
});

export const logsQuerySchema = z.object({
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
  resource: z.string().optional(),
  status: z.number().optional(),
});

export function validatePayload<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `API validation failed: ${result.error.errors.map((e) => e.message).join(", ")}`
    );
  }
  return result.data;
}

export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type LogsQueryInput = z.infer<typeof logsQuerySchema>;
