# Core Infrastructure Architecture

This document describes the architectural layout of the core infrastructure layer of **DevLaunchKit**.

The infrastructure is decoupled into modular packages inside `packages/`, which enforces strict domain boundaries, fast caching, type safety, and tree-shakeability.

## Monorepo Package Dependencies Mapping

Below is a simplified architecture overview:

```mermaid
graph TD
  Env[@devlaunchkit/env] --> Config[@devlaunchkit/config]
  Errors[@devlaunchkit/errors] --> Logger[@devlaunchkit/logger]
  Logger --> Middleware[@devlaunchkit/middleware]
  Cache[@devlaunchkit/cache] --> FeatureFlags[@devlaunchkit/feature-flags]
  FeatureFlags --> Middleware
  Permissions[@devlaunchkit/permissions] --> Middleware
  RateLimit[@devlaunchkit/rate-limit] --> Middleware
  Security[@devlaunchkit/security] --> Middleware
```

## Infrastructure Packages Catalog

| Package                  | Purpose                                                            | Core Exports                                            |
| :----------------------- | :----------------------------------------------------------------- | :------------------------------------------------------ |
| `packages/env`           | Centralized environment schema parsing using Zod.                  | `env`, `envSchema`                                      |
| `packages/config`        | Global configuration options mapped from verified env variables.   | `config`                                                |
| `packages/errors`        | Structured Application Error subclasses and JSON serializers.      | `ApplicationError`, `serializeError`                    |
| `packages/logger`        | High performance log writer featuring Request IDs correlation.     | `logger`, `logContextStorage`                           |
| `packages/cache`         | Caching layer with namespaces, TTL, and tag invalidation.          | `cache`, `NamespacedCache`                              |
| `packages/queue`         | Priority background job queue with DLQ and automatic retry.        | `queue`                                                 |
| `packages/events`        | Fully typed asynchronous internal event bus emitter.               | `eventBus`                                              |
| `packages/observability` | Health check diagnostics, latencies timer, and execution traces.   | `observability`                                         |
| `packages/telemetry`     | CPU load averages and memory allocation counters.                  | `getSystemMetrics`                                      |
| `packages/security`      | Cryptographic AES encryption, CSP header, and secure cookies.      | `encrypt`, `decrypt`, `generateCspHeader`               |
| `packages/validation`    | Request body, query string, and UUID parameters validators.        | `validateBody`, `validateQuery`                         |
| `packages/constants`     | Core constants for roles, HTTP status, and storage buckets.        | `ROLES`, `HTTP_STATUS`                                  |
| `packages/rate-limit`    | Memory and Redis sliding window rate-limiting metrics.             | `apiRateLimiter`, `RateLimiter`                         |
| `packages/middleware`    | Reusable web-compatible middleware gates.                          | `withLogging`, `withRateLimit`, `withFeatureGate`       |
| `packages/hooks`         | React custom hooks (debounce, copy, localStorage, media queries).  | `useFeatureFlag`, `usePermission`, `useLocalStorage`    |
| `packages/utils`         | Pure functional helpers (currency formatters, retry logic, slugs). | `generateId`, `generateSlug`, `retry`, `formatCurrency` |
| `packages/api`           | Standardized API response wrappers.                                | `sendSuccess`, `sendFailure`, `sendPagination`          |

---

## Environment Setup & Variables Load Flow

On startup, `@devlaunchkit/env` performs the following steps:

1. Loads `.env` and `.env.local` using `dotenv`.
2. Validates `process.env` against the Zod strict schema inside `schema.ts`.
3. If validation fails, details all missing keys or parsing errors and exits the process in production (`process.exit(1)`).
4. Exports a read-only frozen type-safe `env` object.
