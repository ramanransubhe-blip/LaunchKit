# System Architecture

DevLaunchKit utilizes a layered workspace architecture.

```mermaid
graph TD
    App[apps/web Next.js Web App] --> API[packages/api Developer SDK]
    API --> Platform[Platform packages: auth, payments, ai, storage, communication]
    Platform --> Db[(packages/database Drizzle ORM)]
```

## Modular Abstractions

Every external vendor connection (e.g. Stripe, OpenAI, Resend) is decoupled behind a unified package interface to allow easy vendor swapping without refactoring the application code.
