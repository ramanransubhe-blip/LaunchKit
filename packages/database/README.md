# @devlaunchkit/database

An enterprise-ready, fully typed database interface package for **LaunchKit** SaaS platforms, built with Supabase PostgreSQL, Drizzle ORM, Zod, and TypeScript.

---

## 🛠️ Folder Structure

- `src/schema/`: Modular database table schemas partitioned by domains.
- `src/relations/`: Explicit schema join relations and cascades.
- `src/repositories/`: Data Access Object (DAO) classes wrapping query builders.
- `src/validators/`: Auto-generated and custom Zod schemas.
- `src/types/`: Types extracted from drizzle schemas.
- `src/seeds/`: Seed script for loading defaults (Roles, Feature flags, etc.) into the DB.
- `src/utils/connection.ts`: Client connection pooling, transactions, and health checks.

---

## 📦 Getting Started

### 1. Configure the Environment

Ensure `DATABASE_URL` is set in your environment or root `.env` file:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/launchkit
```

### 2. Generate Migrations

Generate SQL migrations matching schema modifications:

```bash
pnpm --filter=@devlaunchkit/database db:generate
```

### 3. Push to Database

To push schemas directly during local development:

```bash
pnpm --filter=@devlaunchkit/database db:push
```

### 4. Run Seed Script

Seed your dev database with admin accounts, organization setups, products, and feature flags:

```bash
pnpm --filter=@devlaunchkit/database db:seed
```

---

## 💾 Usage Examples

Import repositories and helpers directly in your API layer or Next.js server actions:

```typescript
import { UserRepository, db } from "@devlaunchkit/database";

const userRepo = new UserRepository();

// Find by email
const user = await userRepo.findByEmail("user@devlaunchkit.com");
```
