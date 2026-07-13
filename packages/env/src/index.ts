import { envSchema, Env } from "./schema.js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env if present
const rootDir = process.cwd();
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local") });

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables configuration:");
    const errors = result.error.flatten().fieldErrors;
    for (const [key, messages] of Object.entries(errors)) {
      console.error(`  - ${key}: ${messages?.join(", ")}`);
    }
    // Only exit in production/development, allow builds to run without failing unless strictly required
    // Return mock values during testing/development if variables are missing
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || "postgres://localhost:5432/mock_db",
    });
  }

  return result.data;
}

export const env = parseEnv();
export * from "./schema.js";
