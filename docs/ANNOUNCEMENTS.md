# Announcements & System Banners

Publish alerts across user dashboards:

---

## Publish Announcement

To publish a dismissible maintenance banner:

```typescript
await comm.sendAnnouncement(
  "Scheduled Maintenance",
  "We are upgrading our databases on Sunday 2:00 AM UTC.",
  { isDismissible: true }
);
```
