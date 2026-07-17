# Authentication Platform Architecture

DevLaunchKit features a provider-agnostic authentication architecture that decouples application business logic from specific authentication services (Better Auth or Clerk).

All authentication operations flow through a canonical, decorated wrapper inside `@devlaunchkit/auth`.

---

## Architecture Overview

```mermaid
graph TD
    App[Next.js App & Server Actions] --> AuthSDK[@devlaunchkit/auth]
    AuthSDK --> Factory[Service Decorator / Factory]
    Factory --> BetterAuth[Better Auth REST Bridge]
    Factory --> Clerk[Clerk REST Bridge]
    BetterAuth --> BA_API[Better Auth API]
    Clerk --> Clerk_API[Clerk Backend API]
```

## Key Abstractions

### 1. `AuthService` Interface

The central contract implemented by all provider adapters:

```typescript
export interface AuthService {
  readonly provider: AuthProviderType;

  // Authentication
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signUp(data: SignUpData): Promise<AuthResult>;
  signOut(sessionId?: string): Promise<void>;

  // Sessions
  getSession(token: string): Promise<AuthSession | null>;
  refreshSession(token: string): Promise<AuthSession>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllSessions(userId: string): Promise<void>;

  // Users
  getUser(userId: string): Promise<AuthUser | null>;
  updateProfile(userId: string, data: UpdateUserData): Promise<AuthUser>;

  // Organizations
  createOrganization(userId: string, data: CreateOrganizationData): Promise<AuthOrganization>;
  inviteToOrganization(
    orgId: string,
    email: string,
    role: OrganizationRole
  ): Promise<AuthInvitation>;
  switchOrganization(userId: string, orgId: string): Promise<void>;
}
```

---

## Decoupling Providers

To switch the active authentication provider, you change only the environment variables or configuration options. Application code remains untouched:

```typescript
// lib/auth.ts
import { createBetterAuthService, createClerkService } from "@devlaunchkit/auth";
import { env } from "@devlaunchkit/env";

export const auth =
  env.AUTH_PROVIDER === "clerk"
    ? createClerkService({ secret: env.CLERK_SECRET_KEY })
    : createBetterAuthService({ baseUrl: env.NEXT_PUBLIC_APP_URL, secret: env.BETTER_AUTH_SECRET });
```
