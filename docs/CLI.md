# Command-Line Interface (CLI) Guide

Scaffolding, diagnostics, and workspace operations using the `devlaunchkit` CLI.

---

## Purpose

This document provides instructions for using the DevLaunchKit Command-Line Interface (CLI) tool. The CLI helps developers scaffold projects, inject integration modules, and check the health of their local workspaces.

## Prerequisites

- Node.js runtime environment configured
- Workspace dependencies installed (`pnpm install`)

---

## Command Reference

The `devlaunchkit` CLI runs via standard terminal commands:

```bash
pnpm doctor
# or run the CLI directly:
npx tsx packages/cli/src/index.ts [command]
```

### 1. `doctor`

Runs comprehensive checks on your runtime environment, dependencies, `.env` file values, and database connection.

```bash
npx tsx packages/cli/src/index.ts doctor
```

- **Checks executed**:
  - Node.js runtime version
  - pnpm package manager version
  - presence of root `node_modules`
  - `.env` file presence and structure validation
  - PostgreSQL database connection health

### 2. `create`

Scaffolds a new project with the standard DevLaunchKit workspaces layout, linking local design tokens, env schemes, and auth adapters.

```bash
npx tsx packages/cli/src/index.ts create my-new-saas
```

- **Arguments**:
  - `<project-name>`: Name of the project directory to create.

### 3. `add`

Adds and configures provider adapters, appending environment variable templates to your `.env` file.

```bash
npx tsx packages/cli/src/index.ts add stripe
```

- **Arguments**:
  - `<provider>`: The provider module name. Supported providers: `stripe`, `clerk`, `betterauth`, `gemini`, `openai`, `anthropic`, `resend`, `redis`.

---

## Screenshots Placeholder

![CLI Doctor Output Running in Terminal](/assets/readme_illustration.png)
_Terminal showing successful doctor checks with color-coded success symbols._

---

## Best Practices

- **Run doctor after updates**: Run `pnpm doctor` whenever you pull commits from the upstream repository or update credentials.
- **Scaffold apps inside `apps/`**: When using `create`, make sure to run the CLI in your workspace `apps/` directory to keep files clean.

## Common Mistakes

- **Running CLI without TSX**: Trying to execute `node packages/cli/src/index.ts` directly, which results in node execution errors because raw typescript files are not compiled.
- **Forgetting to install dependencies**: Running CLI commands before running `pnpm install` in the root workspace.

---

## Troubleshooting

- **Command Not Found Error**:
  - Make sure you are running commands from the root directory of the monorepo.
  - If using the binary directly, run `pnpm install` to link the executables.
- **Doctor reports database connection failure**:
  - Run `docker ps` to verify that your PostgreSQL docker container is running.
  - Check that the `DATABASE_URL` key in your `.env` contains the correct connection password.
