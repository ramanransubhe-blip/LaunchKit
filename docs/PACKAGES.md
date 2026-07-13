# Package Directory Guide

Comprehensive guide to all workspace modules managed in the DevLaunchKit monorepo.

---

## Purpose
This document catalogs the 33 internal packages in `packages/` that form the foundation of DevLaunchKit. Developers can consult this list to understand where specific abstractions and utilities reside.

## Prerequisites
- Familiarity with TypeScript path aliasing and exports
- Basic understanding of ESM package entries

---

## Workspace Packages Catalog

| Package Name | Workspace Path | Primary Purpose | Key Dependencies |
| :--- | :--- | :--- | :--- |
| `@devlaunchkit/ai` | `packages/ai` | Multi-LLM provider abstraction gateway | `openai`, `@google/generative-ai`, `@anthropic-ai/sdk` |
| `@devlaunchkit/analytics` | `packages/analytics` | Product analytics and event ingestion client | Custom fetch client wrappers |
| `@devlaunchkit/api` | `packages/api` | Type-safe Developer SDK client | `zod` |
| `@devlaunchkit/auth` | `packages/auth` | Unified multi-tenant authentication library | `@clerk/clerk-sdk-node`, Better Auth client |
| `@devlaunchkit/cache` | `packages/cache` | Distributed Redis / in-memory cache wrappers | `ioredis` |
| `@devlaunchkit/cli` | `packages/cli` | Official DevLaunchKit command-line operations utility | `commander` |
| `@devlaunchkit/communication` | `packages/communication` | Unified email and notification dispatch gateway | `resend`, `@postmark/postmark` |
| `@devlaunchkit/config` | `packages/config` | Shared Zod environment configuration validation schemes | `zod` |
| `@devlaunchkit/constants` | `packages/constants` | Monorepo-wide global constants and static settings | Static TS exports |
| `@devlaunchkit/database` | `packages/database` | PostgreSQL Drizzle ORM client, schemas, & migrations | `drizzle-orm`, `postgres` |
| `@devlaunchkit/emails` | `packages/emails` | React-Email layout and component templates | `@react-email/components`, `tailwind` |
| `@devlaunchkit/env` | `packages/env` | Multi-environment variable validation engine | `zod`, `dotenv` |
| `@devlaunchkit/errors` | `packages/errors` | Global SaaS error boundaries and error classes | Custom Error extensions |
| `@devlaunchkit/events` | `packages/events` | Internal event bus for pub/sub message brokers | Redis pub-sub interfaces |
| `@devlaunchkit/feature-flags` | `packages/feature-flags` | User and organization feature flags manager | `posthog-node` |
| `@devlaunchkit/hooks` | `packages/hooks` | Reusable client-side React hooks | `react` |
| `@devlaunchkit/logger` | `packages/logger` | Structured JSON Winston cloud logger | `winston` |
| `@devlaunchkit/middleware` | `packages/middleware` | Redirection, security headers, and routing layers | `next` |
| `@devlaunchkit/notifications` | `packages/notifications` | Database-backed in-app user notifications engine | `@devlaunchkit/database` |
| `@devlaunchkit/observability` | `packages/observability` | OpenTelemetry, tracing, and metrics configurations | `@opentelemetry/api` |
| `@devlaunchkit/payments` | `packages/payments` | Payment billing core (Stripe and Dodo Payments) | `stripe` |
| `@devlaunchkit/permissions` | `packages/permissions` | Attribute-based access control (ABAC) engine | Roles definitions |
| `@devlaunchkit/queue` | `packages/queue` | BullMQ background job queues and workers | `bullmq`, `ioredis` |
| `@devlaunchkit/rate-limit` | `packages/rate-limit` | Upstash/Redis token bucket rate limiter | `@upstash/ratelimit` |
| `@devlaunchkit/search` | `packages/search` | Algolia / Elasticsearch index synchronizers | `algoliasearch` |
| `@devlaunchkit/security` | `packages/security` | Data sanitizers, CSRF protection, and encryptors | Node `crypto` |
| `@devlaunchkit/storage` | `packages/storage` | File management gateway (Supabase Storage, S3) | `@aws-sdk/client-s3` |
| `@devlaunchkit/telemetry` | `packages/telemetry` | Client-side user telemetry tracker | Segment wrappers |
| `@devlaunchkit/testing` | `packages/testing` | Shared testing configuration presets | `playwright`, `vitest`, `msw` |
| `@devlaunchkit/types` | `packages/types` | Centralized TypeScript types & data contracts | Domain interfaces |
| `@devlaunchkit/ui` | `packages/ui` | Design system UI component library (Tailwind v4) | `framer-motion`, `lucide-react` |
| `@devlaunchkit/utils` | `packages/utils` | Reusable helper functions and string/date formatters | Native helpers |
| `@devlaunchkit/validation` | `packages/validation` | General schema validation rules | `zod` |

---

## Screenshots Placeholder
![Monorepo Workspace Graph](/assets/readme_illustration.png)
*Visual representation of how various packages compile and link.*

---

## Best Practices
- **Use Namespace Prefixes**: When importing workspace packages, always use the `@devlaunchkit/` prefix (e.g. `@devlaunchkit/ui`), which references local monorepo symlinks.
- **Run Clean Scripts**: If you encounter dependency caching quirks after updating a package's exports, execute `pnpm clean` to flush compiled files and restart.

## Common Mistakes
- **Direct file imports**: Importing from a package using deep paths like `import { something } from "../packages/ui/src/components"` instead of using the entrypoint `import { something } from "@devlaunchkit/ui"`. This bypasses module resolution gates and causes build faults.
- **Forgetting package build**: Adding a new feature to `@devlaunchkit/ui` and using it in `apps/web` without running `pnpm build` to compile the TypeScript definitions.

---

## Troubleshooting
- **Cannot Find Module `@devlaunchkit/X`**:
  - Run `pnpm install` in the root workspace folder to ensure correct workspace symlinks are registered inside `node_modules`.
  - Check the package's local `package.json` file and verify that the `name` field is correctly written (e.g. `"name": "@devlaunchkit/X"`).
- **TypeScript Import Errors in IDE**:
  - If VS Code fails to find updated types, run command: `TypeScript: Restart TS Server` in the command palette.
