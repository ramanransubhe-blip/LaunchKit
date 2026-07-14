import { getCache, setCache, deleteCache } from "@devlaunchkit/cache";
import { createLogger } from "@devlaunchkit/logger";

const logger = createLogger({ service: "cache-service" });

/**
 * Cache-aside pattern implementation for dashboard data.
 * Wraps any async data fetcher with Redis caching.
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  try {
    const cached = await getCache(key);
    if (cached) {
      logger.debug("Cache hit", { key });
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    logger.warn("Cache read failed — falling through to fetcher", { key, error });
  }

  logger.debug("Cache miss", { key });
  const data = await fetcher();

  try {
    await setCache(key, JSON.stringify(data), ttlSeconds);
  } catch (error) {
    logger.warn("Cache write failed", { key, error });
  }

  return data;
}

/**
 * Invalidate a specific cache entry or a group of entries by prefix.
 */
export async function invalidateCache(keyOrPrefix: string): Promise<void> {
  try {
    await deleteCache(keyOrPrefix);
    logger.info("Cache invalidated", { key: keyOrPrefix });
  } catch (error) {
    logger.warn("Cache invalidation failed", { key: keyOrPrefix, error });
  }
}

/**
 * Increment a counter stored in Redis.
 * Useful for real-time dashboard counters (page views, API calls, etc.).
 */
export async function incrementCounter(
  key: string,
  amount: number = 1,
  ttlSeconds: number = 3600
): Promise<number> {
  try {
    const current = await getCache(key);
    const newValue = (parseInt(current ?? "0", 10) || 0) + amount;
    await setCache(key, String(newValue), ttlSeconds);
    return newValue;
  } catch (error) {
    logger.warn("Counter increment failed", { key, error });
    return 0;
  }
}
