# Discount Coupons & Promotions

The platform maps discount calculations and voucher coupon verifications.

---

## Applying Coupons

Verify and attach promotional codes during checkouts:

```typescript
import { getGlobalBillingService } from "@devlaunchkit/payments";

const billing = getGlobalBillingService();

// Apply a promotional code to a customer's active account
await billing.updateCustomer("cust_123", {
  metadata: {
    appliedCoupon: "LAUNCH20",
  }
});
```
