# Dodo Payments Integration Guide

DevLaunchKit uses Dodo Payments as its primary billing adapter, providing hosted checkouts, tax computation, and webhook notifications.

---

## Configuration Variables

Setup these variables inside your root `.env` to activate Dodo Payments:

```env
BILLING_PROVIDER="dodo-payments"
DODO_API_KEY="dk_live_..."
DODO_WEBHOOK_SECRET="dodo_sec_..."
```

---

## Initializing Dodo Services

The factory initializer generates a configured Dodo instance:

```typescript
import { createDodoBillingService, setGlobalBillingService } from "@devlaunchkit/payments";

const billingService = createDodoBillingService({
  apiKey: process.env.DODO_API_KEY,
  webhookSecret: process.env.DODO_WEBHOOK_SECRET,
  isMock: process.env.NODE_ENV !== "production",
});

setGlobalBillingService(billingService);
```
