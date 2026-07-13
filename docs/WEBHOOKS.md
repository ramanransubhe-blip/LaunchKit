# Webhooks Subscription & Signing

LaunchKit includes webhooks queues to dispatch event notifications to client urls.

---

## Verifying Webhook Signatures

Use standard HMAC verifications to secure endpoints:

```typescript
import { validatePayload } from "@devlaunchkit/api";
// Verifies raw request body with standard SHA256 signatures
```
