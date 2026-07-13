export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
}

export class RateLimiter {
  // Store client hits in memory: key -> timestamps array
  private store = new Map<string, number[]>();

  constructor(
    private limit: number, // Max requests allowed per window
    private windowMs: number // Window duration in milliseconds (e.g. 60000 for 1 minute)
  ) {}

  // sliding window check
  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.store.get(key) || [];

    // Filter out expired timestamps outside the sliding window
    timestamps = timestamps.filter((t) => t > windowStart);

    const count = timestamps.length;

    if (count >= this.limit) {
      // Limit exceeded. Calculate time until the oldest request in the window falls out
      const oldestTimestamp = timestamps[0] || now;
      const retryAfterMs = oldestTimestamp + this.windowMs - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      const resetSeconds = Math.ceil((oldestTimestamp + this.windowMs - now) / 1000);

      this.store.set(key, timestamps);

      return {
        allowed: false,
        limit: this.limit,
        remaining: 0,
        resetSeconds,
        retryAfterSeconds,
      };
    }

    // Add current hit timestamp
    timestamps.push(now);
    this.store.set(key, timestamps);

    const remaining = this.limit - timestamps.length;
    const resetMs = (timestamps[0] || now) + this.windowMs - now;
    const resetSeconds = Math.ceil(resetMs / 1000);

    return {
      allowed: true,
      limit: this.limit,
      remaining,
      resetSeconds,
    };
  }

  // Clear limit history
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Default standard API rate-limiter: 100 requests per minute
export const apiRateLimiter = new RateLimiter(100, 60 * 1000);
export default RateLimiter;
