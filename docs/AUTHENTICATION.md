# Authentication Guide

Configuring and managing the provider-agnostic Authentication Platform.

---

## Purpose
This document guides you through configuring, using, and extending the authentication system of DevLaunchKit, detailing how the `AuthService` abstraction decouples application workflows from the selected provider (Better Auth or Clerk).

## Prerequisites
- Auth providers credentials (Clerk publishable/secret keys or Better Auth base parameters)
- Workspace database initialized (required for Better Auth session persistence)

---

## Architecture & AuthService Abstraction

DevLaunchKit wraps all authentication APIs in a canonical interface:

```typescript
export interface AuthService {
  readonly provider: "better-auth" | "clerk";
  
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signUp(data: SignUpData): Promise<AuthResult>;
  signOut(sessionId?: string): Promise<void>;
  getSession(token: string): Promise<AuthSession | null>;
  getUser(userId: string): Promise<AuthUser | null>;
  createOrganization(userId: string, data: CreateOrganizationData): Promise<AuthOrganization>;
}
```

By using this interface, you can swap providers with a single environment variable change:
```env
NEXT_PUBLIC_AUTH_PROVIDER_KEY=clerk  # Switches to Clerk
# or leave undefined to default to Better Auth
```

---

## Configuration Setup

### 1. Better Auth (Default / Self-Hosted)
Better Auth runs locally using your PostgreSQL database for session storage.
1. Add the following keys to your `.env`:
   ```env
   AUTH_SECRET_KEY=generate_a_random_32_character_string
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
2. Better Auth automatically manages sessions in the `session` and `user` tables in your Postgres database.

### 2. Clerk (Managed SaaS)
If you prefer a fully-managed authentication system:
1. Add your Clerk credentials to `.env`:
   ```env
   NEXT_PUBLIC_AUTH_PROVIDER_KEY=clerk
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
2. The `@devlaunchkit/auth` library will automatically route all session validations, user lookups, and organization switch calls to the Clerk backend endpoints instead of the local database tables.

---

## Screenshots Placeholder
![Authentication Flow UI Preview](/assets/authentication.png)
*Unified sign-in widget with support for MFA and social connections.*

---

## Best Practices
- **Use Server Actions**: Always perform session validation and profile updates within Next.js Server Actions or API routes using the server-side auth client.
- **Set Long Keys**: Keep your `AUTH_SECRET_KEY` long and cryptographically secure (e.g., generated via `openssl rand -hex 32`).
- **Synchronize Webhooks**: When using Clerk, configure Clerk Webhooks to synchronize user profiles and organization changes back to your local database.

## Common Mistakes
- **Mixing Provider Variables**: Setting both Clerk keys and Better Auth parameters simultaneously without specifying which provider to target, resulting in configuration collisions.
- **Skipping Database Migrations**: Better Auth requires database tables. Running Better Auth without executing `pnpm --filter @devlaunchkit/database db:push` will result in database execution crashes during login.

---

## Troubleshooting
- **Session Verification Timeout**:
  - Verify that the `DATABASE_URL` is active if you are using Better Auth.
  - Verify that `NEXT_PUBLIC_APP_URL` is configured correctly, matching the origin header of incoming requests.
- **Invalid Auth Credentials Error**:
  - Double check your Clerk secrets or make sure `AUTH_SECRET_KEY` matches between your local dev client and server instances.
