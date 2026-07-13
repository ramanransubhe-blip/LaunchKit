# Production Deployment Guide

Deploying Next.js applications and monorepos to Vercel, Fly.io, or Docker.

---

## Purpose
This document provides production deployment guidelines for DevLaunchKit, outlining steps for Vercel, Fly.io, Docker builds, and database hosting.

## Prerequisites
- Domain name and SSL certificate (if self-hosting)
- Accounts on Vercel, Supabase (for database), or Fly.io (for Docker deployment)

---

## Deployment Strategies

```
                       ┌──────────────────────┐
                       │   Next.js Monorepo   │
                       └──────────┬───────────┘
                                  │
           ┌──────────────────────┴──────────────────────┐
           ▼                                             ▼
  [Serverless (Vercel)]                         [Container (Docker)]
  - Next.js Web App                             - Fly.io / AWS ECS
  - Edge/Serverless functions                   - Docker Compose / Kubernetes
```

---

## Deploying to Vercel (Recommended)

Vercel is the optimal hosting platform for Next.js applications.

### 1. Import Monorepo Project
1. Link your GitHub repository to your Vercel Account.
2. In the project creation panel, set the root directory to `apps/web`.
3. Vercel automatically detects Next.js and configures the default build command.

### 2. Configure Environment Variables
Copy all the environment keys from `.env` (without placeholders) into the Vercel Dashboard project configuration section.

### 3. Build & Output Configuration
Set the following parameters in Vercel:
- **Build Command**: `cd ../.. && pnpm build` (Runs build from monorepo root)
- **Install Command**: `pnpm install`
- **Output Directory**: `.next`

---

## Deploying with Docker

For self-hosting, use the production `Dockerfile` in the root directory:

### 1. Build the Docker Image
```bash
docker build -t devlaunchkit:latest .
```

### 2. Run the Container
```bash
docker run -p 3000:3000 --env-file .env devlaunchkit:latest
```

---

## Database Provisioning

In production, avoid running databases inside Docker containers. Use managed hosting instead:
- **Supabase**: Excellent managed PostgreSQL database hosting with pgvector support. Add your connection link to `.env`:
  ```env
  DATABASE_URL=postgresql://postgres:password@db.project-id.supabase.co:5432/postgres
  ```
- **AWS RDS**: Configure a PostgreSQL instance and secure it within a private VPC, exposing it to your app containers.

---

## Screenshots Placeholder
![Vercel Production Deploy Screen](/assets/readme_illustration.png)
*Vercel deployment logs dashboard showing successful compilation and green status indicators.*

---

## Best Practices
- **Enable Strict SSL**: Always force HTTPS for all web applications. Set `NEXT_PUBLIC_APP_URL` using `https://`.
- **Set Up Connection Pooling**: Serverless deployments spin up multiple functions concurrently. Use connection poolers like Supabase PgBouncer or Supavisor (`port 6543`) to avoid database connection exhaustion.

## Common Mistakes
- **Deploying with env placeholders**: Forgetting to update mock variables in production, leading to user registration or checkout failures.
- **Forgetting db migrations step**: Deploying the application code without executing migrations, which leads to database table error crashes. Make sure to run `drizzle-kit migrate` in your deployment pipeline.

---

## Troubleshooting
- **Database Connection Limit Exceeded**:
  - Switch your connection string to use a transaction-based connection pooler port (usually `6543` on Supabase) rather than the direct database port (`5432`).
- **Next.js Build Failure (Missing workspace packages)**:
  - Verify that the Vercel build command is configured to run from the workspace root rather than just inside `apps/web/`.
- **Static Page Generation Timeout**:
  - Increase your server timeout limits in your deployment config, or change pages that fetch heavy DB queries to use dynamic rendering (`export const dynamic = "force-dynamic"`).
