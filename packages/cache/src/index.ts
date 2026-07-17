export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  invalidateByTags(tags: string[]): Promise<void>;
}

// 1. In-Memory Cache Implementation with Tagging & TTL support
class MemoryCache implements ICache {
  private store = new Map<string, { value: any; expiresAt?: number; tags?: string[] }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number, tags?: string[]): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt, tags });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  // Invalidate all entries tagged with any of the target tags
  async invalidateByTags(tags: string[]): Promise<void> {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.tags && item.tags.some((t) => tags.includes(t))) {
        this.store.delete(key);
      } else if (item.expiresAt && now > item.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// 2. Namespaced Cache Wrapper
export class NamespacedCache {
  constructor(
    private cache: ICache,
    private namespace: string
  ) {}

  private getFullKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.cache.get<T>(this.getFullKey(key));
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.cache.set(this.getFullKey(key), value, ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(this.getFullKey(key));
  }
}

export const cache = new MemoryCache();
export default cache;
