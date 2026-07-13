# DevLaunchKit Knowledge Base

This file is the source of truth for repository-wide architecture and implementation standards.

## Vision

DevLaunchKit is an open-source SaaS starter kit that should stay clean, modular, and production-ready for years.
Every new package must be reusable outside the app, provider-agnostic when possible, and explicit about its boundaries.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase
- Drizzle ORM
- Postgres
- pnpm workspaces
- Turborepo
- Vercel
- Resend
- Dodo Payments
- Vercel AI SDK
- Zod
- Framer Motion

## Coding Standards

- Prefer strict TypeScript with no `any`.
- Prefer composition, dependency injection, and small modules.
- Avoid singleton state unless it is intentionally scoped and documented.
- Keep public APIs typed, documented, and stable.
- Use ASCII unless a file already uses another character set.

## Folder Structure

- `apps/`: deployable applications.
- `packages/`: shared workspace packages.
- `docs/`: long-lived project documentation.
- `scripts/`: workspace scripts and maintenance tools.

## Architecture Principles

- Build through abstractions, not app-specific shortcuts.
- Keep provider SDKs behind adapters.
- Keep cross-cutting concerns separate from business logic.
- Prefer explicit contracts over implicit coupling.
- Preserve existing architecture unless a conflict blocks maintainability.

## Naming Conventions

- Use lower-case package names and folder names.
- Use `create*` factories for composable constructors.
- Use `use*` for React hooks.
- Use `require*` for authorization guards.
- Use domain terms consistently: `user`, `session`, `organization`, `permission`, `role`.

## Package Responsibilities

- `packages/auth`: canonical authentication abstraction, provider adapters, server helpers, client helpers, hooks, middleware, security, tokens, emails, permissions, and validators.
- `packages/database`: persistence layer and Drizzle schema.
- `packages/permissions`: generic platform permission utilities.
- `packages/security`: shared security primitives.
- `packages/events`: shared internal event bus.
- `packages/hooks`: generic React hooks unrelated to auth.

## Security Standards

- Hash passwords with a modern password hashing function.
- Store only token hashes when raw secrets do not need to be persisted.
- Use secure, HTTP-only cookies where applicable.
- Prefer signed or opaque tokens over predictable identifiers.
- Track suspicious login activity and failed attempts.
- Support session rotation and logout everywhere.
- Treat organization membership and role changes as security-sensitive events.

## Documentation Standards

- Every public package must have a `README.md`.
- Every exported function must have a short JSDoc description.
- Every public interface should include an example or usage note.
- Long-lived decisions belong in an ADR file.

## Testing Requirements

- Cover core utilities with unit tests.
- Cover package factories and adapters with integration-style tests.
- Cover authorization and route policy helpers.
- Cover React client hooks and their store behavior.

## Definition of Done

- The code compiles.
- Lint passes.
- Typecheck passes.
- Tests pass.
- Documentation for new public surface area is written.
