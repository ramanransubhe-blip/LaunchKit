# Better Auth Integration Guide

Better Auth is a powerful, developer-friendly self-hosted authentication service. DevLaunchKit integrates it via the `BetterAuthServiceBridge` adapter using standard REST endpoints.

---

## Configuration

To activate Better Auth, configure the following environment variables:

```env
AUTH_PROVIDER="better-auth"
BETTER_AUTH_SECRET="super-secret-better-auth-signing-key-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## REST Endpoints Mapping

The bridge routes canonical calls to standard Better Auth endpoints:

| Operation            | Endpoint                        | Method |
| :------------------- | :------------------------------ | :----- |
| `signIn`             | `/api/auth/sign-in/email`       | `POST` |
| `signUp`             | `/api/auth/sign-up/email`       | `POST` |
| `signOut`            | `/api/auth/sign-out`            | `POST` |
| `getSession`         | `/api/auth/get-session`         | `GET`  |
| `createOrganization` | `/api/auth/organization/create` | `POST` |

---

## Local Development & Mocks

If no server secret is provided or if `isMock: true` is configured, the Better Auth adapter automatically falls back to local in-memory simulation. This allows full offline capability during development and continuous integration tests:

```typescript
const betterAuth = createBetterAuthService({
  baseUrl: "http://localhost:3000",
  secret: "dummy-secret",
  isMock: true, // enables local mock simulation
});
```
