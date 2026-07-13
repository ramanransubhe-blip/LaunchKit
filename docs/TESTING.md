# Testing Guide

Writing and running unit, integration, and E2E browser tests.

---

## Purpose
This document provides guidelines for running, writing, and maintaining tests in DevLaunchKit, covering Playwright E2E browser testing, Vitest unit testing, and Mock Service Worker (MSW) setups.

## Prerequisites
- Node.js environment configured
- Playwright browsers installed: `npx playwright install`

---

## Testing Strategy

DevLaunchKit recommends a three-tier testing approach:

```
                  ┌──────────────────────┐
                  │    Playwright E2E    │  <-- Multi-browser flow tests
                  └──────────┬───────────┘
                             │
                  ┌──────────┴──────────┐
                  │ Vitest Integration  │  <-- Mock API & Database tests
                  └──────────┬───────────┘
                             │
                  ┌──────────┴──────────┐
                  │    Vitest Unit     │  <-- Pure functions & utilities
                  └─────────────────────┘
```

---

## Running Tests

### 1. Unit & Integration Tests (Vitest)
Unit tests are fast and run in-memory:
```bash
pnpm test
```
To run tests in a specific package (e.g. `@devlaunchkit/auth`):
```bash
pnpm --filter @devlaunchkit/auth test
```

### 2. End-to-End Tests (Playwright)
E2E browser tests simulate real user interaction:
```bash
# Start your development server
pnpm dev
# Run E2E tests in another terminal window
pnpm exec playwright test
```

---

## Mocking API Calls with MSW

To prevent calling third-party APIs during testing (like actual Stripe calls), we configure Mock Service Worker (MSW):

```typescript
// packages/testing/src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("https://api.stripe.com/v1/checkout/sessions", () => {
    return HttpResponse.json({
      id: "cs_test_mock_session_id",
      url: "https://checkout.stripe.com/pay/mock"
    });
  })
];
```

---

## Screenshots Placeholder
![Playwright HTML Test Report Dashboard](/assets/storage_platform.png)
*Playwright HTML testing dashboard listing passed browser tests cases.*

---

## Best Practices
- **Use MSW for all external APIs**: Never make real calls to external services during unit tests to avoid flakiness, rate limits, and unexpected costs.
- **Write isolated E2E tests**: Playwright tests should handle logging in automatically using mock cookies rather than walking through the full sign-in form for every spec.

## Common Mistakes
- **Running E2E tests without dev server**: Attempting to execute `playwright test` when the local Next.js dev server is not active on port `3000`.
- **Leaving test database dirty**: Running integration tests that write to the database without resetting/seeding the tables before each run.

---

## Troubleshooting
- **Playwright Browser Installation Error**:
  - If Playwright fails to launch, run `npx playwright install --with-deps` to install all required operating system libraries.
- **Vitest fails with ESM import issues**:
  - Ensure your test configuration includes `"moduleResolution": "Bundler"` or use `tsx` to run script-based tests.
- **Test Database Lock error**:
  - Run database container checks: `docker-compose down && docker-compose up -d` to clean active connection pools.
