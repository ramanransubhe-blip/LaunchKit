# Quick Start Guide

Launch your production-ready SaaS application framework locally in under ten minutes.

---

## Purpose

This document provides a fast-track sequence for developers who want to initialize and start interacting with DevLaunchKit instantly.

## Prerequisites

- Node.js `v20+` & `pnpm 9+`
- Local PostgreSQL instance running (or Docker installed)

---

## The 10-Minute Launch Sequence

### 1. Initialize Workspace

```bash
git clone https://github.com/devlaunchkit/devlaunchkit.git
cd devlaunchkit
pnpm install
```

### 2. Copy Local Overrides

```bash
cp .env.example .env
cp .env.local.example .env.local
```

### 3. Spin Up Services & DB

If you use Docker (recommended):

```bash
docker-compose up -d
```

Generate and run migrations to initialize the PostgreSQL schema:

```bash
pnpm --filter @devlaunchkit/database db:push
```

### 4. Run Seed Data

Seed your database with default system plans, organization roles, and sandbox users:

```bash
pnpm --filter @devlaunchkit/database db:seed
```

### 5. Run Health Validation

Execute the CLI diagnostics script to verify environment parameters:

```bash
pnpm doctor
```

### 6. Boot Dev Servers

```bash
pnpm dev
```

Open `http://localhost:3000` in your web browser.

---

## Example Quick Scaffolding

To scaffold a new workspace sub-project using our official CLI, run:

```bash
pnpm --filter @devlaunchkit/cli devlaunchkit create my-new-saas
```

---

## Screenshots Placeholder

![Command Line Run & App Launch](/assets/authentication.png)
_Initial authentication screen visible after local boot._

---

## Best Practices

- **Verify with Doctor**: Always run `pnpm doctor` after modifying `.env` or pulling updates from upstream repository branches.
- **Seeding local databases**: Run `pnpm --filter @devlaunchkit/database db:seed` when testing billing flows to populate your local database with Stripe product catalog definitions.

## Common Mistakes

- **Port Conflict**: PostgreSQL container fails to start because port `5432` is locked by a pre-existing local service. Run `pg_ctl stop` or use another port.
- **Skipping Database Seeding**: Leaving database empty will cause mock login attempts to fail due to missing tenant organizations and system roles definitions.

---

## Troubleshooting

- **Database Seed Errors**:
  - Verify that migrations have been successfully run: `pnpm --filter @devlaunchkit/database db:push`.
  - Check that the `DATABASE_URL` string matches the correct connection parameters.
- **Next.js Compilation Warning**:
  - Next.js might complain about missing Clerk / Better Auth environment variables. You can ignore these warnings for local runs as the application automatically falls back to secure simulation adapters.
