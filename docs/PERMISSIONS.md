# Access Permissions & Sharing Rules

LaunchKit allows fine-grained sharing parameters on individual assets.

---

## File Share Action

Modify sharing permissions dynamically using `storage.share`:

```typescript
const storage = getGlobalStorageService();

// Grant public access to an asset
await storage.share("bucket", "reports/q4.pdf", "public");

// Restrict access back to organization members
await storage.share("bucket", "reports/q4.pdf", "org");
```
