# Subscription Lifecycles & Transitions

The billing platform defines a uniform model to transition subscription plans.

---

## Subscription Status Matrix

| Status | Details | Allow Actions |
| :--- | :--- | :--- |
| `active` | Payment is current | Upgrade, Downgrade, Cancel |
| `past_due` | Retrying failing payment | Retry Payment |
| `paused` | Paused temporarily | Resume |
| `canceled` | Period ended and revoked | Re-subscribe |

---

## Upgrade or Downgrade Plan

To transition active plans:

```typescript
import { getGlobalBillingService } from "@devlaunchkit/payments";

const billing = getGlobalBillingService();
await billing.upgradePlan("sub_123", "price_new_premium");
```
