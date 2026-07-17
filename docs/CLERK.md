# Clerk Integration Guide

Clerk is a fully managed, enterprise-grade authentication platform. DevLaunchKit integrates it via the `ClerkServiceBridge` adapter communicating directly with the Clerk Backend REST API.

---

## Configuration

To activate Clerk, set the following environment variables:

```env
AUTH_PROVIDER="clerk"
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
```

---

## Backend API Endpoints Mapping

The Clerk bridge makes HTTP requests directly to the Clerk API (`https://api.clerk.com/v1`):

| Operation              | Clerk Endpoint                       | Method |
| :--------------------- | :----------------------------------- | :----- |
| `signIn`               | `/users/verify-password`             | `POST` |
| `signUp`               | `/users`                             | `POST` |
| `signOut`              | `/sessions/{sessionId}/revoke`       | `POST` |
| `getSession`           | `/sessions/{token}`                  | `GET`  |
| `createOrganization`   | `/organizations`                     | `POST` |
| `inviteToOrganization` | `/organizations/{orgId}/invitations` | `POST` |

---

## Local Development & Mocks

When local mock mode is configured, the Clerk adapter returns simulated user profile records matching the canonical structure, facilitating fast offline testing:

```typescript
const clerk = createClerkService({
  secret: "dummy-secret",
  isMock: true, // enables local mock simulation
});
```
