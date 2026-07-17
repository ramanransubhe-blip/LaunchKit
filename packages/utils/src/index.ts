import crypto from "node:crypto";

// 1. ID & Slug Generators
export function generateId(prefix = ""): string {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}_${uuid.replace(/-/g, "")}` : uuid;
}

export function generateSlug(text: string): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

  while (slug.startsWith("-")) {
    slug = slug.slice(1);
  }
  while (slug.endsWith("-")) {
    slug = slug.slice(0, -1);
  }
  return slug;
}

// 2. Date Helpers
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function timeAgo(date: Date | string | number): string {
  const now = Date.now();
  const time = new Date(date).getTime();
  const diffMs = now - time;

  if (diffMs < 0) return "in the future";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;

  return formatDate(date);
}

// 3. Number & Currency Formatters
export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(num: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(num);
}

// 4. String Helpers
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 5. Array Helpers
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// 6. Object Helpers
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as any;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// 7. Async & Flow Helpers
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  backoffFactor = 2
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      const waitTime = delayMs * Math.pow(backoffFactor, attempt - 1);
      await sleep(waitTime);
    }
  }
  throw new Error("Retry loop exhausted");
}

// 8. Pagination Details
export function getPaginationOffset(page: number, pageSize: number): number {
  const p = Math.max(1, page);
  return (p - 1) * pageSize;
}
