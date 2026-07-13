import { z } from "zod";

// Environment specifications schema
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform((val) => parseInt(val, 10)).default("3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  
  // Database Connection
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Authentication Keys
  NEXT_PUBLIC_AUTH_PROVIDER_KEY: z.string().optional(),
  AUTH_SECRET_KEY: z.string().optional(),

  // Payments (Stripe)
  STRIPE_API_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // AI APIs
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),

  // Cache & Redis
  REDIS_URL: z.string().optional(),

  // Logging & Diagnostics
  NEXT_PUBLIC_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;
