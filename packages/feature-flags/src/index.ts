import { cache } from "@devlaunchkit/cache";

export interface FeatureFlag {
  key: string;
  isEnabled: boolean;
  percentageRollout?: number; // Value between 0 and 100
  environments?: string[]; // e.g. ["development", "production"]
  rules?: {
    userIds?: string[];
    orgIds?: string[];
    startAt?: string; // ISO datetime string
    endAt?: string; // ISO datetime string
  };
}

export interface EvaluationContext {
  userId?: string;
  orgId?: string;
  environment?: string;
}

// Simple deterministic hash to ensure consistent percentage rollout values per user/org
function getDeterministicPercent(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export class FeatureFlagsManager {
  private flags = new Map<string, FeatureFlag>();

  // Register or update local mock catalog flags
  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
  }

  // Fetch flag from local registry
  getFlag(key: string): FeatureFlag | null {
    return this.flags.get(key) || null;
  }

  // Core evaluation logic
  async evaluate(key: string, context: EvaluationContext = {}): Promise<boolean> {
    // 1. Check cache first
    const cacheKey = `ff:${key}:${context.userId || "anon"}:${context.orgId || "anon"}`;
    const cachedResult = await cache.get<boolean>(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    const flag = this.getFlag(key);
    if (!flag) {
      return false; // Default off if not found
    }

    const result = this.evaluateRules(flag, context);

    // 2. Cache evaluated result for 60 seconds
    await cache.set(cacheKey, result, 60);
    return result;
  }

  private evaluateRules(flag: FeatureFlag, context: EvaluationContext): boolean {
    if (!flag.isEnabled) {
      return false;
    }

    const now = new Date();

    // Environment restriction check
    if (flag.environments && context.environment) {
      if (!flag.environments.includes(context.environment)) {
        return false;
      }
    }

    // Time-based restrictions check
    if (flag.rules?.startAt) {
      const start = new Date(flag.rules.startAt);
      if (now < start) return false;
    }
    if (flag.rules?.endAt) {
      const end = new Date(flag.rules.endAt);
      if (now > end) return false;
    }

    // Direct User/Org overrides check
    if (flag.rules?.userIds && context.userId) {
      if (flag.rules.userIds.includes(context.userId)) {
        return true;
      }
    }
    if (flag.rules?.orgIds && context.orgId) {
      if (flag.rules.orgIds.includes(context.orgId)) {
        return true;
      }
    }

    // Percentage Rollout check
    if (flag.percentageRollout !== undefined) {
      const identifier = context.userId || context.orgId;
      if (!identifier) {
        // Fallback to random distribution for anonymous users
        return Math.random() * 100 < flag.percentageRollout;
      }
      const userPercent = getDeterministicPercent(identifier);
      return userPercent < flag.percentageRollout;
    }

    return true;
  }
}

export const featureFlags = new FeatureFlagsManager();
export default featureFlags;
