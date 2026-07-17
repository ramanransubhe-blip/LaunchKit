# Developer API & SDK Guide

Consuming type-safe endpoints using the `LaunchKitClient` SDK.

---

## Purpose

This document provides specifications for the DevLaunchKit API endpoints layer, detailing rate-limiting policies, middleware headers, and usage of the type-safe developer SDK `@devlaunchkit/api`.

## Prerequisites

- Node.js runtime environment configured
- Redis container running (required for rate limiter token bucket checks)

---

## Type-Safe SDK Client

DevLaunchKit includes a type-safe client library `@devlaunchkit/api` that maps user schemas to endpoints. This guarantees compilation errors if API routes change, preventing runtime data contract errors.

```typescript
import { LaunchKitClient } from "@devlaunchkit/api";

const client = new LaunchKitClient({
  baseUrl: "http://localhost:3000",
  apiKey: "your_api_token",
});

// Fetch user profile securely
const profile = await client.users.getProfile();
console.log(`Hello, ${profile.name}!`);
```

---

## API Route Design

All REST routes are declared inside Next.js App Router folders under `apps/web/app/api/`:

### Endpoint Routing Specifications

| Method   | Path                    | Description                       | Access         | Rate Limit  |
| :------- | :---------------------- | :-------------------------------- | :------------- | :---------- |
| `GET`    | `/api/v1/users/me`      | Fetch active session user profile | Auth Session   | 100 req/min |
| `POST`   | `/api/v1/projects`      | Scaffold a project workspace      | API Key / Auth | 60 req/min  |
| `DELETE` | `/api/v1/projects/[id]` | Delete project workspace data     | Org Owner      | 30 req/min  |
| `POST`   | `/api/v1/ai/completion` | Stream LLM completions prompt     | Auth Session   | 20 req/min  |

---

## Middleware & Rate-Limiting

Every incoming API request passes through `@devlaunchkit/middleware` and `@devlaunchkit/rate-limit` using Redis token buckets:

```typescript
// packages/rate-limit/src/index.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "60 s"), // 60 requests per minute
});
```

When a rate limit is exceeded, the server responds with:

- **Status Code**: `429 Too Many Requests`
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed in cycle.
  - `X-RateLimit-Remaining`: Remaining request capacity.
  - `X-RateLimit-Reset`: Unix timestamp when bucket resets.

---

## Screenshots Placeholder

![Fuzzy Search & Command Palette API Lookup](/assets/readme_illustration.png)
_Fuzzy command console (Cmd+K) showing developer API configurations lookup._

---

## Best Practices

- **Never expose Master API Keys**: Always use temporary developer session tokens in client bundles. Master keys must remain strictly server-side.
- **Implement request retry loops**: When calling API endpoints, configure the client to handle `429` responses with an exponential backoff retry system.

## Common Mistakes

- **Hardcoding Bearer Token**: Storing authentication Bearer tokens in plain text in client code, exposing them to security breaches.
- **Skipping Cors Settings**: Accessing the API from separate subdomains without adding them to your Next.js middleware CORS origin whitelist.

---

## Troubleshooting

- **API returns `401 Unauthorized`**:
  - Verify that the `Authorization` header is correctly structured as `Bearer <token>`.
  - Check that the session token has not expired by verifying session parameters in your database.
- **Rate Limit Triggered (Status 429)**:
  - If your local test script triggers a 429, make sure your Redis container is healthy: `docker ps`.
  - You can temporarily override rate limit rules by modifying environment parameters inside `.env`.
