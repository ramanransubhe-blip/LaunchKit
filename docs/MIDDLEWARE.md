# Reusable Middleware Layer

**DevLaunchKit** exports edge-compatible, reusable middleware helper pipelines for security, performance diagnostics, and access gates.

## Middleware Library Catalog

All middlewares are declared inside `@devlaunchkit/middleware`.

### 1. Request Logging & Timing Middleware

Decorates the request execution cycle, tracking correlation IDs and printing response statuses and performance durations:

```typescript
import { withLogging } from "@devlaunchkit/middleware";

const response = await withLogging(req, async () => {
  return new Response("Success");
});
```

### 2. API Rate Limiting Gate

Performs sliding window rate limit checks on client keys (e.g. client IP or auth user ID), throwing a `RateLimitError` (yielding HTTP 429) if breached:

```typescript
import { withRateLimit } from "@devlaunchkit/middleware";

try {
  await withRateLimit(req, clientIpAddress);
} catch (err) {
  // Returns HTTP 429 Response
}
```

### 3. Feature Flag Gate

Validates client access against feature flag specifications, throwing an `AuthorizationError` (yielding HTTP 403) if disabled:

```typescript
import { withFeatureGate } from "@devlaunchkit/middleware";

await withFeatureGate("beta-chat-enabled", { userId: "usr_123" });
```

### 4. RBAC Permission Gate

Validates client role permissions, throwing an `AuthorizationError` (yielding HTTP 403) if unauthorized:

```typescript
import { checkPermission } from "@devlaunchkit/middleware";

checkPermission(user.role, "manage:users");
```

### 5. Maintenance Mode Gate

Blocks incoming requests and displays an HTTP 503 response if the `maintenance-mode` feature toggle is active:

```typescript
import { checkMaintenanceMode } from "@devlaunchkit/middleware";

await checkMaintenanceMode();
```
