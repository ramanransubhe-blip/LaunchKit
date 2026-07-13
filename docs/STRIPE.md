# Stripe Integration Guide

Stripe is supported as a secondary payment provider, mapping checkout sessions, portal sessions, and subscription statuses.

---

## Configuration Variables

Setup these variables inside your root `.env` to activate Stripe:

```env
BILLING_PROVIDER="stripe"
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Initializing Stripe Services

```typescript
import { createStripeBillingService, setGlobalBillingService } from "@devlaunchkit/payments";

const billingService = createStripeBillingService({
  apiKey: process.env.STRIPE_API_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  isMock: process.env.NODE_ENV !== "production",
});

setGlobalBillingService(billingService);
```
