# @devlaunchkit/auth

Provider-agnostic authentication platform supporting **Better Auth** and **Clerk** behind a unified backend and frontend contract.

---

## Key Features

- **Decoupled Architecture**: No provider-specific imports leak into the main application. Switch providers by changing configuration only.
- **Unified Contracts**: Exposes identical `AuthService` (Server) and `AuthClient` (Client/React hooks) interfaces.
- **Centralized RBAC**: Hierarchical roles and permissions resolution.
- **Edge-Ready Middleware**: Custom session-checking gates and protected path matching.
- **Local Dev Simulation**: Complete offline mock implementation for all endpoints.

---

## Provider Comparison

| Feature | Better Auth | Clerk |
| :--- | :--- | :--- |
| **Hosting** | Self-hosted / Local DB | Managed SaaS |
| **API Backend** | Local Node REST API | Clerk Cloud API |
| **Local Mocks** | Supported | Supported |
| **OAuth Providers**| Google, GitHub | Google, GitHub, Apple, etc. |

---

## Configuration Guide

Set the provider name in your root `.env`:

```env
AUTH_PROVIDER="better-auth" # or "clerk"
```

Initialize the service:

```typescript
import { createBetterAuthService, createClerkService, setGlobalAuthService } from "@devlaunchkit/auth/server";

const authService = process.env.AUTH_PROVIDER === "clerk"
  ? createClerkService({ secret: process.env.CLERK_SECRET_KEY })
  : createBetterAuthService({ baseUrl: process.env.NEXT_PUBLIC_APP_URL, secret: process.env.BETTER_AUTH_SECRET });

setGlobalAuthService(authService);
```
