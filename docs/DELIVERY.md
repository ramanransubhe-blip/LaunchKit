# Delivery Tracking & Webhooks

Log and observe message delivery statuses.

---

## Tracking Delivery Statuses

Check tracking metrics for a message:

```typescript
const delivery = await comm.track("msg_123");
console.log(`Status: ${delivery.status}`); // "queued", "sent", "delivered", "opened", etc.
```
