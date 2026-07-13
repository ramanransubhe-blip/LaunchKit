# Developer SDK (`LaunchKitClient`)

The `@devlaunchkit/api` package exports a typed developer client SDK (`LaunchKitClient`) to manage communication with Auth, Billing, AI, Storage, and Communication layers.

---

## Initializing Client

```typescript
import { LaunchKitClient } from "@devlaunchkit/api";

const sdk = new LaunchKitClient({
  baseUrl: "https://api.yoursite.com/v1",
  apiKey: "lk_live_...",
});
```

---

## SDK Methods Example

```typescript
// AI Completions
const aiResult = await sdk.ai.generateText({ prompt: "Summarize feedback" });

// Storage uploads
const uploadResult = await sdk.storage.upload("avatars", "logo.png", base64Content);
```
