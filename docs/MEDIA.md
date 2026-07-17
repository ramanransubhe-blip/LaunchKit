# Media Handlers & Types

DevLaunchKit classifies uploaded assets into structured categories:

---

## Media Classification Schema

| Category     | Typical MIME Types                      | Metadata Extracted     |
| :----------- | :-------------------------------------- | :--------------------- |
| **Image**    | `image/jpeg`, `image/png`, `image/webp` | Width, Height, Format  |
| **Video**    | `video/mp4`, `video/webm`               | Duration, Resolution   |
| **Audio**    | `audio/mpeg`, `audio/wav`               | Duration, Format       |
| **Document** | `application/pdf`, `text/markdown`      | Page Count, Word Count |

---

## File Inspection Example

```typescript
const meta = await storage.getMetadata("bucket", "uploads/profile.png");
console.log(`Content Type: ${meta.contentType} Size: ${meta.size} bytes`);
```
