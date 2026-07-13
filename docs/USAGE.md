# Usage Tracking & User Quotas

Enforce rate limits, user resource quotas, and billing subscription checks before completing queries.

---

## Quota Checks

Validate user credit balances:

```typescript
const quota = await checkUserQuota(userId);
if (quota.tokensUsed >= quota.tokensLimit) {
  throw new Error("AI query quota exceeded. Purchase credits to continue.");
}
```
