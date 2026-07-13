import { env } from "@devlaunchkit/env";

export const config = {
  app: {
    name: "DevLaunchKit",
    url: env.NEXT_PUBLIC_APP_URL,
    env: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.NEXT_PUBLIC_LOG_LEVEL,
  },
  db: {
    url: env.DATABASE_URL,
  },
  auth: {
    providerKey: env.NEXT_PUBLIC_AUTH_PROVIDER_KEY,
    secretKey: env.AUTH_SECRET_KEY,
  },
  payments: {
    stripeKey: env.STRIPE_API_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
  email: {
    resendKey: env.RESEND_API_KEY,
  },
  ai: {
    openaiKey: env.OPENAI_API_KEY,
    anthropicKey: env.ANTHROPIC_API_KEY,
  },
  cache: {
    redisUrl: env.REDIS_URL,
  },
  queue: {
    redisUrl: env.REDIS_URL,
  },
} as const;

export type Config = typeof config;
export default config;
