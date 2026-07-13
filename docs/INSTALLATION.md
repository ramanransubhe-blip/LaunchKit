# Installation Guide

Comprehensive setup guide to configure the DevLaunchKit monorepo environment locally.

---

## Purpose
This guide walks you through the step-by-step process of setting up a local development environment for DevLaunchKit, ensuring all runtime engines, local databases, cache stores, and node dependencies are successfully initialized.

## Prerequisites
Before starting, ensure your local machine has the following tools installed and configured:
- **Node.js**: `v20.0.0` or higher (LTS recommended)
- **pnpm**: `v9.0.0` or higher
- **Docker & Docker Compose**: For running local Postgres and Redis instances
- **Git**: For version control

---

## Step-by-Step Installation

### 1. Clone the Repository
Clone the codebase and navigate to the project root directory:
```bash
git clone https://github.com/devlaunchkit/devlaunchkit.git
cd devlaunchkit
```

### 2. Install Monorepo Dependencies
Install node dependencies using `pnpm` workspace resolution:
```bash
pnpm install
```

### 3. Setup Local Services
DevLaunchKit utilizes Docker to run PostgreSQL and Redis containers. Boot these containers in the background:
```bash
docker-compose up -d
```
> [!NOTE]
> This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 4. Configure Environment Variables
Copy the default environment templates to create your local `.env` and `.env.local` files:
```bash
cp .env.example .env
cp .env.local.example .env.local
```
Open `.env` and configure your credentials. At minimum, ensure `DATABASE_URL` matches your local PostgreSQL container string:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/launchkit
```

### 5. Run Database Migrations
Initialize database schemas and tables using Drizzle ORM:
```bash
pnpm --filter @devlaunchkit/database db:push
```

### 6. Run Workspace Diagnostics
Verify your environment configuration and connectivity by running the doctor utility:
```bash
pnpm doctor
```

### 7. Start the Development Server
Launch the Next.js application and the Turborepo compilation watcher:
```bash
pnpm dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## Screenshots Placeholder
![Local Environment Up and Running](/assets/dashboard_screenshot.png)
*Visual confirmation of successful local server startup.*

---

## Best Practices
- **Use pnpm Workspace Commands**: Always run commands using `pnpm --filter <package-name> <script>` when targetting specific modules rather than running raw scripts in nested directories.
- **Isolate Local Configs**: Keep credentials in `.env.local` or `.env` and never commit them to git repository. Ensure `.env` is listed in your `.gitignore`.
- **Match Runtime Versions**: Keep Node.js aligned with the project's recommended `v20` LTS version to prevent build or testing behavior disparities.

## Common Mistakes
1. **Running `npm install`**: DevLaunchKit uses pnpm workspaces. Running `npm install` or `yarn install` will result in duplicate lockfiles, broken package hoisting, and dependency errors.
2. **Missing Local Docker Run**: Forgetting to execute `docker-compose up -d` before starting the application will trigger database connection timeout failures.
3. **Using Default Placeholders in Production**: Committing placeholder env credentials to cloud hosting configurations.

---

## Troubleshooting
- **Database Connection Refused**:
  - Run `docker ps` to verify that the `devlaunchkit-postgres` container is running and active on port `5432`.
  - Check that no local PostgreSQL system services are already running on port `5432` which might conflict with the Docker container.
- **Workspace Typecheck Failures**:
  - Clear the local Turborepo cache and build output folders:
    ```bash
    pnpm clean
    pnpm install
    pnpm dev
    ```
