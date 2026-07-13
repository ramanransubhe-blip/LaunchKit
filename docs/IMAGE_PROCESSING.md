# Image Processing & Conversions

LaunchKit exposes resizing, format conversions, and watermark capabilities.

---

## Resize Parameters

Generate processed variants by targeting specific widths:

```typescript
const result = await storage.upload("bucket", "thumbs/img.png", buffer, {
  contentType: "image/png",
  // Metadata fields can define optimization steps
});
```
