# Upload Controls & Server Actions

Guidelines to manage file uploads and trigger server-side actions in LaunchKit.

---

## File Upload Action

To upload a file using the validated Next.js Server Action:

```typescript
import { uploadFileAction } from "@devlaunchkit/storage";

const base64Content = Buffer.from("File content").toString("base64");
const result = await uploadFileAction(
  {
    bucket: "avatars",
    path: "user-123/avatar.jpg",
    isPublic: true,
  },
  base64Content
);
```
