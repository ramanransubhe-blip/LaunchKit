# Usage-Based Billing & Credits System

LaunchKit features real-time usage metrics collection and prepaid credit tracking.

---

## Usage Meters Tracking

Log user usage metrics using the unified `BillingService`:

```typescript
const billing = getGlobalBillingService();

// Log API requests consumption
const usage = await billing.getUsage("org_uuid_1", "api_requests");
if (usage.usageValue >= usage.limitValue) {
  throw new Error("Usage quota exceeded. Upgrade plan to resume operations.");
}
```

---

## Credits Balance System

Manage prepaid query credits or AI token allocations:

```typescript
// Add prepaid credits on successful top-up checkout
await billing.addCredits("org_uuid_1", 1000);

// Consume credits during operations
await billing.consumeCredits("org_uuid_1", 50);
```
