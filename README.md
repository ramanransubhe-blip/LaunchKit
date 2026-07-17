<!-- HERO IMAGE -->

<div align="center">
  <h1>DevLaunchKit</h1>
  <p><strong>Open-source SaaS starter kit. Production-ready out of the box.</strong></p>
  <p>Modular, provider-agnostic monorepo built on Next.js 15, React 19, and Turborepo.</p>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Build](https://img.shields.io/badge/Build-Passing-success.svg?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/devlaunchkit/devlaunchkit/actions)
[![Tests](https://img.shields.io/badge/Tests-Passing-success.svg?style=flat-square&logo=jest&logoColor=white)](tests/)
[![Coverage](https://img.shields.io/badge/Coverage-94%25-success.svg?style=flat-square)](tests/)
[![Version](https://img.shields.io/badge/v1.1.0-blue.svg?style=flat-square)](https://github.com/devlaunchkit/devlaunchkit/releases)

</div>

<div align="center">
  <a href="docs/QUICK_START.md">Quick Start</a> •
  <a href="docs/ARCHITECTURE.md">Architecture</a> •
  <a href="docs/BILLING.md">Billing</a> •
  <a href="docs/AI.md">AI</a> •
  <a href="docs/CLI.md">CLI</a> •
  <a href="ROADMAP.md">Roadmap</a> •
  <a href="CONTRIBUTING.md">Contributing</a>
</div>

---

## Why DevLaunchKit

Every SaaS starts with the same grind — auth, database, payments, emails, CI/CD — before you write a single line of product code. That setup is mostly identical across projects and it slows everything down.

DevLaunchKit gives you a production-ready foundation with all of that already wired up. Each platform (auth, billing, storage, etc.) sits behind a provider-agnostic interface, so you can swap Stripe for Dodo Payments or Clerk for Better Auth without touching your app code.

It's a **starting point**, not a framework. Standard TypeScript, Turborepo monorepo, clear package boundaries. You own the code — modify, extend, or remove anything.

---

## Supported Providers

| Platform    | Default          | Also supported | Planned               |
| :---------- | :--------------- | :------------- | :-------------------- |
| **Auth**    | Better Auth      | Clerk          | Auth0, NextAuth       |
| **Billing** | Dodo Payments    | Stripe         | Lemon Squeezy, Paddle |
| **AI**      | OpenAI (GPT-4o)  | Gemini, Claude | —                     |
| **Storage** | Supabase Storage | AWS S3         | Cloudflare R2         |
| **Email**   | Resend           | Postmark       | SendGrid              |

---

## What's Included

- **Provider abstraction** — swap vendors without rewriting app code
- **End-to-end TypeScript** — from DB schemas to the client SDK
- **Turborepo monorepo** — incremental builds, task caching
- **React Server Components** — Next.js App Router, streaming SSR
- **Multi-model AI** — OpenAI, Gemini, Claude with streaming + Zod validation
- **Dashboard** — sidebar, `Cmd+K` palette, org switcher, settings
- **Auth** — MFA, OAuth, magic links, RBAC
- **Billing** — subscriptions, seat billing, coupons, customer portal
- **Storage** — signed URLs, access control, image optimization
- **Admin panel** — user management, feature flags, health monitoring
- **CLI** — scaffold, add providers, environment checks
- **CI/CD** — ESLint, Husky, Jest, Playwright, GitHub Actions

<!-- FEATURE IMAGE -->

---

## Architecture

<!-- ARCHITECTURE DIAGRAM -->

```
                         ┌──────────────────────┐
                         │   apps/web (Next)    │
                         └──────────┬───────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
 ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
 │ @dlk/auth    │            │ @dlk/database│            │ @dlk/payments│
 └──────┬───────┘            └──────┬───────┘            └──────┬───────┘
        ▼                           ▼                           ▼
  [BetterAuth/Clerk]         [Postgres/Prisma]           [Stripe/Dodo]
```

Dependencies flow one way: `apps/` imports from `packages/`, never the reverse.

---

## Project Structure

```
.
├── apps/
│   └── web/                   # Next.js 15 app (React 19, Tailwind v4)
├── packages/
│   ├── ai/                    # LLM abstraction (OpenAI, Gemini, Claude)
│   ├── analytics/             # Event tracking
│   ├── api/                   # Typed SDK client (LaunchKitClient)
│   ├── auth/                  # Multi-tenant auth
│   ├── cache/                 # Redis / in-memory caching
│   ├── cli/                   # devlaunchkit CLI
│   ├── communication/         # Email + notification dispatch
│   ├── config/                # Shared env config (Zod)
│   ├── constants/             # Global constants
│   ├── database/              # DB client, migrations, schemas
│   ├── emails/                # React Email templates
│   ├── env/                   # Env validation
│   ├── errors/                # Error classes
│   ├── events/                # Pub/sub event bus
│   ├── feature-flags/         # Feature flags
│   ├── hooks/                 # Shared React hooks
│   ├── logger/                # Structured logging (Winston)
│   ├── middleware/             # Auth, headers, redirects
│   ├── notifications/         # In-app notifications
│   ├── observability/         # OpenTelemetry
│   ├── payments/              # Billing (Stripe, Dodo)
│   ├── permissions/           # ABAC engine
│   ├── queue/                 # Background jobs (BullMQ)
│   ├── rate-limit/            # Rate limiting (Upstash/Redis)
│   ├── search/                # Search (Algolia, Elasticsearch)
│   ├── security/              # CSRF, sanitization, encryption
│   ├── storage/               # File uploads (Supabase, S3)
│   ├── telemetry/             # Client-side telemetry
│   ├── testing/               # Test presets (Jest, Playwright)
│   ├── types/                 # Shared types
│   ├── ui/                    # Design system (Tailwind + Radix)
│   ├── utils/                 # Helper functions
│   └── validation/            # Schema validation (Zod)
├── docs/                      # Documentation
├── examples/                  # Example apps
└── scripts/                   # Dev scripts
```

---

## Platforms

### 🔐 Auth

MFA, OAuth (Google/GitHub), magic links, RBAC. Providers: Better Auth, Clerk.

<!-- AUTHENTICATION SCREENSHOT -->

### 💳 Billing

Subscriptions, seat billing, coupons, customer portal. Providers: Dodo Payments, Stripe.

<!-- BILLING DASHBOARD SCREENSHOT -->

### 🤖 AI

Streaming responses, structured Zod output, token tracking. Providers: OpenAI, Gemini, Claude.

<!-- AI PLATFORM SCREENSHOT -->

### 📁 Storage

Signed URLs, access control, image optimization. Providers: Supabase Storage, S3.

<!-- STORAGE PLATFORM SCREENSHOT -->

### ✉️ Email & Notifications

React Email templates, scheduled dispatch, in-app notification sync. Providers: Resend, Postmark.

### 🔌 API & SDK

Typed client (`LaunchKitClient`), OpenAPI generation, cursor pagination.

### 🖥️ Dashboard

Collapsible sidebar, `Cmd+K` command palette, org switcher, settings pages.

<!-- DASHBOARD SCREENSHOT -->

### ⚙️ Admin Console

Secure control panel to manage users, track billing, toggle settings, and read user feedback.

<!-- ADMIN PANEL SCREENSHOT -->

- **Security:** Edge middleware and server-side checks keep non-admin users out.
- **Analytics:** Simple charts showing active users, MRR, ARR, and subscription splits.
- **User Management:** Search, sort, paginate, change user roles, or suspend accounts.
- **Subscriptions:** Track active, cancelled, or unpaid customer plans in one view.
- **Feedback:** View bug reports and feature requests from users.
- **System Settings:** Change app branding or toggle maintenance mode.

---

## Quick Start

Requires Node.js `v24+` and pnpm `v9+`.

```bash
git clone https://github.com/devlaunchkit/devlaunchkit.git
cd devlaunchkit
pnpm install
pnpm bootstrap
pnpm dev
```

Production build: `pnpm build`

---

## CLI

```bash
npx devlaunchkit create my-app      # scaffold a project
npx devlaunchkit add payments/stripe # add a provider
npx devlaunchkit doctor             # check environment
```

---

## Roadmap

| Phase | Status         | Highlights                                      |
| :---- | :------------- | :---------------------------------------------- |
| **1** | ✅ Done        | Monorepo, Turborepo, Better Auth                |
| **2** | ✅ Done        | Payments (Stripe + Dodo), S3, multi-LLM gateway |
| **3** | ✅ Done        | Admin console v1.1                              |
| **4** | 🚀 In progress | CLI tool, OpenAPI generation                    |
| **5** | 📅 Planned     | Edge routing, billing ledger, WebSocket support |

---

## Contributing

Check the [Contributing Guide](CONTRIBUTING.md). We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

---

## Community

<!-- SPONSORS IMAGE -->

- **Instagram:** [@rmn.core_7](https://www.instagram.com/rmn.core_7/)
- **X:** [@rmncore7](https://x.com/rmncore7)
- **LinkedIn:** [Raman R](https://www.linkedin.com/in/raman-r-2aa784403/)

---

## License

MIT — see [LICENSE](LICENSE).

---

## FAQ

**Can I swap the database?**
Yes. Change the Prisma connection URL and schema provider. Postgres, MySQL, CockroachDB all work.

**Can I use packages standalone?**
Yes. Every package is self-contained — copy it into any existing Next.js project.

**Self-hosting?**
Multi-stage [Dockerfile](Dockerfile) and [docker-compose.yml](docker-compose.yml) included. Works on AWS, Fly.io, Railway, or any VPS.
