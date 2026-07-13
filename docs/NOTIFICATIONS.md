# User In-App Notifications

LaunchKit manages notifications inside the collapsible dashboard drawer system:

---

## Send Notification Alerts

Dispatch a user-scoped in-app notification:

```typescript
await comm.sendNotification(
  "user_uuid_123",
  "API Key Revoked",
  "Your API key was revoked due to inactivity.",
  { priority: "high", category: "security" }
);
```
