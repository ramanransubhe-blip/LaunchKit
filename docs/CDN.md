# CDN & Signed Url Links

Integrate CDNs and generate expiring signed URLs for private asset access.

---

## Signed URL Generation

Generate secure links that expire after a specific number of seconds:

```typescript
const storage = getGlobalStorageService();
const link = await storage.generateSignedUrl("bucket", "contracts/NDA.pdf", 3600);
// Returns a URL containing access tokens valid for 1 hour
```
