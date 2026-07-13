# Monorepo Guide

Managing the multi-package Turborepo workspace.

---

## Purpose
This guide covers how DevLaunchKit uses Turborepo and pnpm workspaces to manage, compile, lint, and test multiple packages concurrently with fast incremental caching.

## Prerequisites
- Familiarity with Turborepo task pipelines
- Basic understanding of the pnpm lockfile structure

---

## Turborepo Core Pipeline

The monorepo configuration is managed by the root `turbo.json` file. It maps out dependencies between build scripts and enables parallel executions:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Script Tasks Pipeline Flow

```
           ┌──────────────┐
           │ pnpm build   │
           └──────┬───────┘
                  │ (Depends on dependencies first)
       ┌──────────┴──────────┐
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ packages/*   │      │ apps/web     │
└──────────────┘      └──────────────┘
```

---

## Running Tasks with Filter Flags

To optimize local development, use Turborepo filter flags to target specific applications or packages:

### Build only the CLI package
```bash
pnpm build --filter=@devlaunchkit/cli
```

### Start development server for Next.js app only
```bash
pnpm dev --filter=@devlaunchkit/web
```

### Run tests in database package
```bash
pnpm test --filter=@devlaunchkit/database
```

---

## Screenshots Placeholder
![Turborepo Build Cache In Action](/assets/readme_illustration.png)
*Turborepo logging build hits and cached packages execution.*

---

## Best Practices
- **Enable Remote Caching**: For distributed teams or CI/CD pipelines, configure Vercel Remote Caching (`npx turbo login`) to share compilation caches and slash build times.
- **Declare Outputs Correctly**: Always verify that compilation output directories (like `dist/` or `out/`) are declared in the task's `outputs` array in `turbo.json` so Turborepo can cache them.

## Common Mistakes
- **Running tsc manually**: Avoid running global `tsc` at root without filter flags, as this will attempt to compile all workspace packages in a single thread, bypassing Turborepo's multi-threaded pipeline.
- **Forgetting dependencies build**: Trying to start the web app dev server without compiling dependencies first. Next.js might complain about missing workspace files. (Running `pnpm dev` automatically handles dependencies builds).

---

## Troubleshooting
- **Build Cache Not Invalidation**:
  - If a package build is behaving unexpectedly, clear Turborepo's local cache folders:
    ```bash
    pnpm clean
    ```
  - This removes all `.turbo` directories, `.next` build caches, and compiled `dist` files, allowing you to run a fresh build: `pnpm build`.
- **Package Not Recognized**:
  - Ensure the package has a unique name in its local `package.json` and is located in a folder covered by `pnpm-workspace.yaml`.
- **Type errors during workspace builds**:
  - Run `pnpm typecheck` to verify strict compiler flags across all packages simultaneously.
