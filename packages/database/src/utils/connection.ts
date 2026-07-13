import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/launchkit";

// Postgres client with pool and retry configurations
export const client = postgres(connectionString, {
  max: 15,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false, // Recommended for serverless environment connections (like Supabase PgBouncer/Supavisor)
});

// Configure Drizzle ORM instance
export const db = drizzle(client);

// Connection retry runner helper
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      console.warn(`⚠️ Database connection warning, retrying attempt ${attempt}/${retries} in ${delayMs}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Database execution failed after max retries.");
}

// Health check function
export async function checkDatabaseHealth(): Promise<{ status: "healthy" | "unhealthy"; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    // Run simple quick validation query
    await client`SELECT 1`;
    return {
      status: "healthy",
      latencyMs: Date.now() - start,
    };
  } catch (error: any) {
    return {
      status: "unhealthy",
      error: error.message || String(error),
    };
  }
}

// Custom Transaction Wrapper with retry
export async function runInTransaction<T>(
  callback: (tx: any) => Promise<T>,
  options?: { isolationLevel?: "read uncommitted" | "read committed" | "repeatable read" | "serializable" }
): Promise<T> {
  return withDbRetry(async () => {
    return await db.transaction(callback, options);
  });
}
