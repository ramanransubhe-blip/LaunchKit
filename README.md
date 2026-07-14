<!-- HERO IMAGE -->

<div align="center">
  <h1>DevLaunchKit</h1>
  <p><strong>The Production-Grade, Open-Source SaaS Application Framework</strong></p>
  <p>Launch fully-featured, scale-ready SaaS products in hours, not weeks. Completely modular, provider-agnostic, and built on Next.js Server Components and Turborepo.</p>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/devlaunchkit/devlaunchkit/actions)
[![Tests Status](https://img.shields.io/badge/Tests-Passing-success.svg?style=flat-square&logo=jest&logoColor=white)](tests/)
[![Coverage](https://img.shields.io/badge/Coverage-94%25-success.svg?style=flat-square)](tests/)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg?style=flat-square)](https://github.com/devlaunchkit/devlaunchkit/releases)
[![Stars](https://img.shields.io/badge/Stars-1-yellow.svg?style=flat-square&logo=github)](https://github.com/devlaunchkit/devlaunchkit/stargazers)
[![Downloads](https://img.shields.io/badge/Downloads-0-blue.svg?style=flat-square&logo=npm)](https://www.npmjs.com/)
[![Contributors](https://img.shields.io/badge/Contributors-0-blue.svg?style=flat-square&logo=github)](https://github.com/devlaunchkit/devlaunchkit/graphs/contributors)

</div>

<div align="center">
  <a href="docs/INSTALLATION.md">Installation</a> •
  <a href="docs/QUICK_START.md">Quick Start</a> •
  <a href="docs/ARCHITECTURE.md">Architecture</a> •
  <a href="docs/MONOREPO.md">Monorepo</a> •
  <a href="docs/AUTHENTICATION.md">Auth</a> •
  <a href="docs/BILLING.md">Billing</a> •
  <a href="docs/AI.md">AI</a> •
  <a href="docs/STORAGE.md">Storage</a> •
  <a href="docs/CLI.md">CLI</a> •
  <a href="docs/DEPLOYMENT.md">Deployment</a> •
  <a href="docs/TESTING.md">Testing</a> •
  <a href="docs/SECURITY.md">Security</a> •
  <a href="ROADMAP.md">Roadmap</a> •
  <a href="CONTRIBUTING.md">Contributing</a> •
  <a href="docs/FAQ.md">FAQ</a>
</div>

---

## 📈 GitHub Stats

| Metric                  | Current Status | Goal (Target Q4) |
| :---------------------- | :------------- | :--------------- |
| **GitHub Stars**        | ⭐ 1           | ⭐ 25,000        |
| **Forks**               | 🍴 0           | 🍴 3,000         |
| **Active Contributors** | 👥 0           | 👥 100+          |
| **Monthly Downloads**   | 📦 0           | 📦 300,000       |

---

## ⚡ Why DevLaunchKit Exists

Traditional SaaS boilerplates are a double-edged sword. They get you started quickly but leave you permanently bound to their pre-selected vendors. Swapping Clerk for Better Auth, or Stripe for Dodo Payments, usually requires dissecting and rewriting your entire core codebase.

**DevLaunchKit breaks this cycle.** Built as an enterprise-grade monorepo foundation, it decouples application logic from third-party vendors. Every core capability—Authentication, Billing, AI, Storage, and Communication—is abstracted behind a provider-agnostic engine. Swap vendors by changing environment variables or minimal configuration tweaks, without touching your business logic.

---

## 📊 Comparison

| Feature            | DevLaunchKit                      | Traditional Boilerplates     | Custom Build           |
| :----------------- | :-------------------------------- | :--------------------------- | :--------------------- |
| **Vendor Lock-in** | 🚫 **None** (Provider-agnostic)   | ⚠️ High (Hardcoded vendors)  | 🚫 None                |
| **Architecture**   | 🏗️ Decoupled Monorepo (Turborepo) | 📦 Single monolithic starter | Variable (High effort) |
| **Type Safety**    | 🛡️ Strict, End-to-End             | ⚠️ Partial / Loose           | Custom implementation  |
| **AI Integration** | 🤖 Multi-LLM Gateway (Stream/Zod) | 🚫 Basic API templates       | High complexity        |
| **Maintenance**    | 🔧 Easy (Decoupled packages)      | ⚠️ Brittle upgrade paths     | High overhead          |
| **Time to Market** | ⏱️ **Hours**                      | Days                         | Months                 |

---

## 🔌 Provider Support Matrix

| Platform               | Primary Provider (Default) | Secondary Provider                 | Staging / Planned                      |
| :--------------------- | :------------------------- | :--------------------------------- | :------------------------------------- |
| **Authentication**     | Better Auth                | Clerk                              | Auth0, NextAuth                        |
| **Billing & Payments** | Dodo Payments              | Stripe                             | Lemon Squeezy, Paddle                  |
| **AI Gateway**         | OpenAI (`gpt-4o`)          | Google Gemini (`gemini-1.5-flash`) | Anthropic Claude (`claude-3-5-sonnet`) |
| **Storage & Media**    | Supabase Storage           | AWS S3                             | Cloudflare R2                          |
| **Communication**      | Resend                     | Postmark                           | SendGrid, Twilio SMS                   |

---

## 🛡️ Core Feature Matrix

- **Provider Abstraction:** Swap auth, billing, AI, storage, and notification vendors with zero code rewrites.
- **Strict Type Safety:** Absolute end-to-end TypeScript validation from database schemas to client API routes.
- **Turborepo Monorepo:** Incremental builds, multi-threaded pipelines, and isolated dependencies.
- **Server Components:** Built with Next.js App Router for optimal load performance and rendering.
- **Streaming AI Engines:** Unified handlers for OpenAI, Gemini, and Anthropic with structured Zod outputs.
- **Modern Dashboard:** Built-in collapsible layouts, fuzzy command palette (`Cmd+K`), and organization switchers.
- **Enterprise Authentication:** Ready-to-go Multi-Factor Auth (MFA), Single Sign-On (SSO), and session managers.
- **Flexible Payments:** Single charges, seat-based licensing, and usage billing via Stripe or Dodo Payments.
- **Secure Storage:** Granular access controls, automated optimization pipelines, and multi-cloud adapters.
- **Developer Console:** Built-in operations dashboard to manage users, configurations, and check system health.
- **Custom CLI Tool:** Scaffold, check environments, and inject providers via `devlaunchkit CLI`.
- **Quality Infrastructure:** Flat ESLint configs, Husky-enforced hooks, and full Jest/Playwright automation.

<!-- FEATURE IMAGE -->

---

## 📐 Architecture

DevLaunchKit utilizes a strict unidirectional dependency structure. Shared functions and vendor abstractions are isolated under `packages/` as separate packages, ensuring that `apps/` only import what they explicitly require.

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

---

## 📂 Project Structure

```
.
├── .github/                   # CI/CD Workflows, pull request templates, and funding configs
├── .husky/                    # Git Hooks for Precommit linting and commit message checks
├── .vscode/                   # Recommended editor workspace configurations
├── apps/                      # Monorepo Application entries
│   └── web/                   # Main Next.js web application (React 19, Tailwind CSS v4)
├── packages/                  # Highly modular, shared packages
│   ├── ai/                    # Multi-LLM provider abstraction gateway
│   ├── analytics/             # Product analytics and event ingestion client
│   ├── api/                   # Type-safe developer SDK (LaunchKitClient)
│   ├── auth/                  # Unified multi-tenant authentication library
│   ├── cache/                 # Distributed Redis / in-memory cache wrappers
│   ├── cli/                   # Official devlaunchkit command-line utility
│   ├── communication/         # Unified email and notification dispatch gateway
│   ├── config/                # Shared zod environment configurations
│   ├── constants/             # Monorepo-wide global constants and settings
│   ├── database/              # Client wrappers, database migrations, and schema configs
│   ├── emails/                # React-Email layout and component templates
│   ├── env/                   # Multi-environment variable validation engine
│   ├── errors/                # Global SaaS error boundaries and error classes
│   ├── events/                # Internal event bus for pub/sub message brokers
│   ├── feature-flags/         # User and organization feature flags manager
│   ├── hooks/                 # Reusable client-side React hooks
│   ├── logger/                # Structured JSON winston cloud logger
│   ├── middleware/            # Redirection, security headers, and routing layers
│   ├── notifications/         # DB-backed in-app user notifications engine
│   ├── observability/         # OpenTelemetry, tracing, and metrics configurations
│   ├── payments/              # Payment billing core (Stripe and Dodo Payments)
│   ├── permissions/           # Attribute-based access control (ABAC) engine
│   ├── queue/                 # BullMQ background job queues and workers
│   ├── rate-limit/            # Upstash/Redis token bucket rate limiter
│   ├── search/                # Algolia / Elasticsearch index synchronizers
│   ├── security/              # Data sanitizers, CSRF protection, and encryptors
│   ├── storage/               # File management gateway (Supabase Storage, S3)
│   ├── telemetry/             # Client-side user telemetry tracker
│   ├── testing/               # Shared testing configuration presets (Jest, Playwright)
│   ├── types/                 # Shared TypeScript models and schema definitions
│   ├── ui/                    # Tailwind CSS design system UI library
│   ├── utils/                 # Global, framework-agnostic helper functions
│   └── validation/            # General schema validation rules
├── docs/                      # Extensive platform documentation
├── examples/                  # Clean configuration and integration recipes
└── scripts/                   # Workspace development lifecycle scripts (bootstrap, clean, verify)
```

---

## 📦 Packages

Here is a breakdown of all the packages managed within the monorepo workspace.

| Package                       | Path                                                       | Purpose                                                  | Primary Integrations       |
| :---------------------------- | :--------------------------------------------------------- | :------------------------------------------------------- | :------------------------- |
| `@devlaunchkit/ai`            | [`packages/ai`](file:///packages/ai)                       | Multi-LLM provider abstraction gateway                   | OpenAI, Gemini, Claude     |
| `@devlaunchkit/analytics`     | [`packages/analytics`](file:///packages/analytics)         | Product analytics and event ingestion client             | Custom ingestion endpoints |
| `@devlaunchkit/api`           | [`packages/api`](file:///packages/api)                     | Type-safe Developer SDK client                           | Fetch, LaunchKitClient     |
| `@devlaunchkit/auth`          | [`packages/auth`](file:///packages/auth)                   | Unified multi-tenant authentication library              | Better Auth, Clerk         |
| `@devlaunchkit/cache`         | [`packages/cache`](file:///packages/cache)                 | Distributed Redis / in-memory cache wrappers             | Redis, Memory cache        |
| `@devlaunchkit/cli`           | [`packages/cli`](file:///packages/cli)                     | Official devlaunchkit command-line utility               | Node CLI                   |
| `@devlaunchkit/communication` | [`packages/communication`](file:///packages/communication) | Unified email and notification dispatch gateway          | Resend, Postmark           |
| `@devlaunchkit/config`        | [`packages/config`](file:///packages/config)               | Shared zod environment configurations                    | Zod                        |
| `@devlaunchkit/constants`     | [`packages/constants`](file:///packages/constants)         | Monorepo-wide global constants and settings              | Static configs             |
| `@devlaunchkit/database`      | [`packages/database`](file:///packages/database)           | Client wrappers, database migrations, and schema configs | Prisma, Postgres           |
| `@devlaunchkit/emails`        | [`packages/emails`](file:///packages/emails)               | React-Email layout and component templates               | React Email, Tailwind      |
| `@devlaunchkit/env`           | [`packages/env`](file:///packages/env)                     | Multi-environment variable validation engine             | Zod                        |
| `@devlaunchkit/errors`        | [`packages/errors`](file:///packages/errors)               | Global SaaS error boundaries and error classes           | TypeScript classes         |
| `@devlaunchkit/events`        | [`packages/events`](file:///packages/events)               | Internal event bus for pub/sub message brokers           | Redis, RabbitMQ            |
| `@devlaunchkit/feature-flags` | [`packages/feature-flags`](file:///packages/feature-flags) | User and organization feature flags manager              | PostHog, Custom DB         |
| `@devlaunchkit/hooks`         | [`packages/hooks`](file:///packages/hooks)                 | Reusable client-side React hooks                         | React Hooks                |
| `@devlaunchkit/logger`        | [`packages/logger`](file:///packages/logger)               | Structured JSON winston cloud logger                     | Winston                    |
| `@devlaunchkit/middleware`    | [`packages/middleware`](file:///packages/middleware)       | Redirection, security headers, and routing layers        | Next.js Middleware         |
| `@devlaunchkit/notifications` | [`packages/notifications`](file:///packages/notifications) | DB-backed in-app user notifications engine               | DB models                  |
| `@devlaunchkit/observability` | [`packages/observability`](file:///packages/observability) | Metrics and trace collection                             | OpenTelemetry, Honeycomb   |
| `@devlaunchkit/payments`      | [`packages/payments`](file:///packages/payments)           | Payment billing core                                     | Stripe and Dodo Payments   |
| `@devlaunchkit/permissions`   | [`packages/permissions`](file:///packages/permissions)     | Attribute-based access control (ABAC) engine             | Custom logic               |
| `@devlaunchkit/queue`         | [`packages/queue`](file:///packages/queue)                 | BullMQ background job queues and workers                 | BullMQ, Redis              |
| `@devlaunchkit/rate-limit`    | [`packages/rate-limit`](file:///packages/rate-limit)       | Endpoint protection and limits                           | Upstash, Redis             |
| `@devlaunchkit/search`        | [`packages/search`](file:///packages/search)               | Algolia / Elasticsearch index synchronizers              | Algolia, Elasticsearch     |
| `@devlaunchkit/security`      | [`packages/security`](file:///packages/security)           | Data sanitizers, CSRF protection, and encryptors         | Node Crypto                |
| `@devlaunchkit/storage`       | [`packages/storage`](file:///packages/storage)             | File management gateway                                  | Supabase Storage, S3       |
| `@devlaunchkit/telemetry`     | [`packages/telemetry`](file:///packages/telemetry)         | Client-side user telemetry tracker                       | Segment, Mixpanel          |
| `@devlaunchkit/testing`       | [`packages/testing`](file:///packages/testing)             | Shared testing configuration presets                     | Jest, Playwright           |
| `@devlaunchkit/types`         | [`packages/types`](file:///packages/types)                 | Shared TypeScript models and schema definitions          | TypeScript                 |
| `@devlaunchkit/ui`            | [`packages/ui`](file:///packages/ui)                       | Tailwind CSS design system UI library                    | Tailwind CSS, Radix UI     |
| `@devlaunchkit/utils`         | [`packages/utils`](file:///packages/utils)                 | Global, framework-agnostic helper functions              | JavaScript helpers         |
| `@devlaunchkit/validation`    | [`packages/validation`](file:///packages/validation)       | General schema validation rules                          | Zod                        |

---

## 🛠️ Tech Stack

We utilize a curated selection of industry-standard tools and technologies.

| Category          | Technology      | Purpose               | Key Benefits                                   |
| :---------------- | :-------------- | :-------------------- | :--------------------------------------------- |
| **Framework**     | Next.js 15+     | Application Core      | React Server Components, Streaming, API routes |
| **UI Rendering**  | React 19        | View Engine           | Actions, async hooks, rendering optimizations  |
| **Styling**       | Tailwind CSS v4 | CSS styling           | Design-token based, clean utility architecture |
| **Orchestration** | Turborepo       | Monorepo pipeline     | Remote caching, zero-overhead task execution   |
| **Package Mgr**   | pnpm v9         | Dependency resolution | Strict workspace resolution, disk efficiency   |
| **Validation**    | Zod             | Runtime validation    | Strict environment checks, schema guarantees   |
| **CLI Runtime**   | tsx             | Node script execution | Zero-config TypeScript scripting support       |

---

## 🚀 Platforms

### 🔐 Authentication Platform

The `@devlaunchkit/auth` library abstracts user identities. It provides pre-built workflows for passwordless log-ins, session management, and multi-tenant organization boundaries.

<!-- AUTHENTICATION SCREENSHOT -->

- **Supported Providers:** Better Auth (Default), Clerk.
- **Key Features:** Multi-Factor Authentication (MFA), OAuth2 (Google, GitHub), Magic Link logins, and RBAC-ready workspace settings.

### 💳 Billing Platform

The `@devlaunchkit/payments` engine runs subscriptions and one-off checkouts using a single `BillingService` interface.

<!-- BILLING DASHBOARD SCREENSHOT -->

- **Supported Providers:** Dodo Payments (Primary), Stripe (Secondary).
- **Key Features:** Metered pricing, seat tracking, promotion codes, tax compliance, and self-serve billing portals.

### 🤖 AI Platform

The `@devlaunchkit/ai` library provides a unified interface to easily call any language model.

<!-- AI PLATFORM SCREENSHOT -->
<!-- AI CHAT GIF -->

- **Supported Providers:** OpenAI (GPT-4o), Google Gemini, Anthropic Claude.
- **Key Features:** Server action response streaming, schema-enforced JSON completions, and automated token cost logging.

### 📁 Storage Platform

The `@devlaunchkit/storage` package enables file uploads and downloads.

<!-- STORAGE PLATFORM SCREENSHOT -->

- **Supported Providers:** Supabase Storage (Primary), AWS S3 (Secondary).
- **Key Features:** Signed temporary links, access matrix, and automatic image formats optimization.

### ✉️ Communication Platform

The `@devlaunchkit/communication` module handles both transactional emails and notification triggers.

- **Supported Providers:** Resend (Primary), Postmark (Secondary).
- **Key Features:** Responsive React Email templates, scheduled dispatches, and DB-synced notifications drawers.

### 🔌 API Platform & SDK

Build developer-first APIs out of the box with the `@devlaunchkit/api` package. It provides a typed SDK client (`LaunchKitClient`) to query your backend seamlessly.

- **Features:** Automated OpenAPI/Swagger generation, type-safe API routing boundaries, and cursor-based paginator utils.

### 🛠️ Dashboard Framework

The `@devlaunchkit/ui` library powers a highly interactive, accessible SaaS user dashboard framework.

<!-- DASHBOARD SCREENSHOT -->

- **Features:** Collapsible sidebar layouts, fuzzy command palette search (`Cmd+K`), organization switchers, and settings templates.

### 🛠️ Admin & Operations Console

Manage your SaaS business operations through a high-performance administration dashboard.

<!-- ADMIN PANEL SCREENSHOT -->

- **Features:** User directories, organization upgrade/downgrade panels, feature-flag toggling, and live service health monitoring gauges.

---

## 💻 Developer Experience & CLI

DevLaunchKit includes a dedicated, interactive CLI tool to speed up environment bootstrapping and add modular providers.

```bash
# Scaffold a new microservice or project
npx devlaunchkit create my-new-app

# Add a payment provider into the workspace
npx devlaunchkit add payments/stripe

# Verify env configurations and dependency health
npx devlaunchkit doctor
```

---

## 💡 Example Applications

We provide several fully-configured, production-quality example applications inside the [`examples/`](file:///examples) directory:

- **[`ai-saas`](file:///examples/ai-saas)**: AI Chat assistant & image generator integrating `@devlaunchkit/ai`, Better Auth, and Stripe.
- **[`crm`](file:///examples/crm)**: Customer Relation Manager with `@devlaunchkit/database`, Clerk authentication, and Algolia search.
- **[`subscription-saas`](file:///examples/subscription-saas)**: Subscription Starter template with Dodo Payments, Supabase Storage, and Resend mailers.
- **[`internal-dashboard`](file:///examples/internal-dashboard)**: Admin telemetry tool with PostgreSQL database, telemetry tracking, and Redis.
- **[`marketplace`](file:///examples/marketplace)**: Multi-vendor marketplace with Stripe Connect, storage uploads, and feature flags.
- **[`developer-tool`](file:///examples/developer-tool)**: Developer dashboard with type-safe SDK client, rate limiting, and BullMQ queues.
- **[`knowledge-base`](file:///examples/knowledge-base)**: Searchable documentation platform with Pgvector semantic search and Anthropic summaries.

---

## ⚡ Quick Start & Installation

### 1. Clone & Install

Ensure Node.js `v24.0.0+` and pnpm `v9.0.0+` are installed:

```bash
git clone https://github.com/devlaunchkit/devlaunchkit.git
cd devlaunchkit
pnpm install
```

### 2. Bootstrap the Workspace

Generate the configurations, environment files, and local packages dependencies:

```bash
pnpm bootstrap
```

### 3. Start Development

Launch the local Turborepo pipeline (Next.js client and local dev tools concurrently):

```bash
pnpm dev
```

### 4. Production Build

Validate compile output and assets packaging:

```bash
pnpm build
```

---

## 📍 Roadmap

| Milestone   | Target | Status         | Highlights                                                          |
| :---------- | :----- | :------------- | :------------------------------------------------------------------ |
| **Phase 1** | Q1     | ✅ Completed   | Core monorepo setup, Turborepo linking, Better Auth integration     |
| **Phase 2** | Q2     | ✅ Completed   | Payments engine with Stripe/Dodo, S3 uploads, multi-LLM AI gateway  |
| **Phase 3** | Q3     | 🚀 In Progress | Admin operations console, OpenAPI spec generator, Custom CLI tool   |
| **Phase 4** | Q4     | 📅 Scheduled   | Edge routing optimization, billing ledger history, WebSocket broker |

---

## 🤝 Contributing

We welcome community contributions! Please review our [Contributing Guide](CONTRIBUTING.md) to get started.

### Branch Conventions

- `main` — Production branch.
- `dev` — Core staging branch.
- `feature/*` — Feature additions.
- `bugfix/*` — Issue patches.

### Commit Guidelines

We enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
`feat(auth): add Better Auth provider configuration`

---

## 💖 Sponsors & Community

Special thanks to our sponsors who keep DevLaunchKit moving forward.

<!-- SPONSORS IMAGE -->

- **Chat with us:** Join our [Discord Server](https://discord.gg/devlaunchkit) to meet other builders.
- **Updates:** Follow [@DevLaunchKit](https://twitter.com/devlaunchkit) on Twitter.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.

---

## ❓ FAQ

#### Can I swap the database engine?

Yes. `@devlaunchkit/database` decouples the database engine configuration. You can switch from Postgres to MySQL or CockroachDB by tweaking the connection URL and updating the Prisma schema provider type.

#### How is type safety guaranteed across API boundaries?

The `@devlaunchkit/api` package creates Zod schema models of all requests/responses. These schemas are shared with the typed `LaunchKitClient`, ensuring client-side requests match backend endpoints validation exactly at compile time.

#### Can I use this for non-monorepo projects?

Yes. Although DevLaunchKit is optimized as a monorepo workspace for long-term scalability, each package inside `packages/` is completely standalone. You can copy individual modules (like `@devlaunchkit/auth` or `@devlaunchkit/payments`) and drop them directly into existing standalone Next.js applications.

#### Does DevLaunchKit support self-hosting?

Absolutely. A production-grade multi-stage [Dockerfile](file:///Dockerfile) and a [docker-compose.yml](file:///docker-compose.yml) config are included, allowing you to deploy the entire stack to AWS, Fly.io, Railway, or VPS servers in seconds.
