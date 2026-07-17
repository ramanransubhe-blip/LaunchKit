# Frequently Asked Questions (FAQ)

Common questions about the DevLaunchKit framework, monorepos, and integrations.

---

## Purpose

This document provides answers to common questions about using, deploying, and optimizing DevLaunchKit.

## Prerequisites

None.

---

## General Questions

### 1. Why use a monorepo instead of a standard boilerplate template?

Traditional single-project boilerplate templates get you started quickly, but make updates difficult. Because DevLaunchKit separates core services (like `@devlaunchkit/auth`, `@devlaunchkit/payments`) into isolated packages, you can update, audit, or swap vendors without breaking your Next.js application code.

### 2. How easy is it to swap provider integrations (e.g. swap Clerk for Better Auth)?

Extremely easy. Because everything is built around provider-agnostic interfaces (like `AuthService`), swapping vendors is simply a matter of modifying your `.env` parameters. The framework detects your active keys and instantiates the correct service adapter automatically.

### 3. What are the running costs for hosting DevLaunchKit?

- **Local development**: $0 (Runs fully-featured using local Docker containers for PostgreSQL and Redis).
- **Production start**: $0 - $15/mo (Deploy on Vercel's free tier, run your database on Supabase's free tier, and use free sandbox accounts for Resend and Stripe).
- **Scale**: Variable depending on your user volume and database connection demands.

---

## Technical Questions

### 4. Can I use a different ORM instead of Drizzle?

Yes. Although Drizzle is the default ORM due to its speed, type-safety, and serverless compatibility, you can swap it by modifying the `@devlaunchkit/database` package. Replace the Drizzle client configuration with Prisma or raw Postgres-js queries, keeping the same repository interface exports.

### 5. Why does the doctor command fail on pnpm in some environments?

If `pnpm doctor` reports that pnpm is not found, verify that the `pnpm` command is accessible from your shell terminal. On Windows, you may need to add the pnpm installation path to your System Environment variables.

---

## Screenshots Placeholder

![Fuzzy Search & Command Palette FAQ](/assets/readme_illustration.png)
_Admin panel Command Palette showing built-in search tool for fast documentation lookup._

---

## Best Practices

- **Consult ARCHITECTURE.md first**: Before making major directory structure changes, read our architectural guidelines to maintain unidirectional package import rules.
- **Keep credentials in .env.local**: Never write API keys or passwords directly inside package files.

## Common Mistakes

- **Forgetting to rebuild after package edits**: Modifying code in `@devlaunchkit/ui` and wondering why the changes are not visible in `apps/web`. (Always run `pnpm build` or keep `pnpm dev` running to watch for changes).
- **Using npm commands**: Using `npm install` inside monorepos, which will break workspace links.

---

## Troubleshooting

- **Monorepo build fails after pulling changes**:
  - Run `pnpm clean` followed by `pnpm install` and `pnpm build` to flush old compiler outputs.
- **Next.js returns Hydration errors on pages**:
  - Hydration errors usually occur if you render dynamic data (like dates or random numbers) on the server that differs from the client state. Wrap those modules inside dynamic imports with `ssr: false`.
