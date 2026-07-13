# Structured Logging System

**DevLaunchKit** implements a high-performance structured console logger that formats output automatically based on the application environment.

## Key Features
1. **Environment Aware**:
   * **Development**: Color-coded console output.
   * **Production**: Single-line structured JSON output designed for cloud log aggregators (Datadog, GCP Logs, AWS Cloudwatch).
2. **Context Correlation**: Tracks `requestId`, `correlationId`, `userId`, and `orgId` automatically across async code scopes using Node's `AsyncLocalStorage`.
3. **Log Levels**: Support for `debug`, `info`, `warn`, `error`, and `fatal`.

---

## Usage Examples

### Logging Messages
```typescript
import { logger } from "@devlaunchkit/logger";

// Simple logging
logger.info("Server listening on port 3000");

// Logging with structured metadata
logger.warn("Stripe webhook retry detected", { attempt: 2, invoiceId: "in_123" });

// Logging errors (extracts messages, names, and stack traces)
try {
  // logic
} catch (err) {
  logger.error("Failed to process transaction", err);
}
```

### Injecting Context Correlation IDs
Use the `logContextStorage` runner to automatically inject request scopes into all log statements executed within that callback trace:

```typescript
import { logContextStorage, logger } from "@devlaunchkit/logger";

logContextStorage.run({ requestId: "req_abc", userId: "usr_999" }, () => {
  // Any logs written here will automatically display request context details
  logger.info("Connecting to database pool..."); 
  // Output: [2026-07-12T...] INFO [reqId:req_abc]: Connecting to database pool...
});
```
