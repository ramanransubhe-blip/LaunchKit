import { z } from "zod";
import { ValidationError } from "@devlaunchkit/errors";

// Validate request body
export function validateBody<T>(schema: z.Schema<T>, body: any): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError("Invalid request body payload", result.error.flatten().fieldErrors);
  }
  return result.data;
}

// Validate URL params
export function validateParams<T>(schema: z.Schema<T>, params: any): T {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new ValidationError("Invalid URL request parameters", result.error.flatten().fieldErrors);
  }
  return result.data;
}

// Validate URL query params
export function validateQuery<T>(schema: z.Schema<T>, query: any): T {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw new ValidationError("Invalid query string parameters", result.error.flatten().fieldErrors);
  }
  return result.data;
}

// Custom Zod schema rules exports
export const idSchema = z.string().uuid("Invalid UUID format");
export const emailSchema = z.string().email("Invalid email address format");
export const slugSchema = z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens");
