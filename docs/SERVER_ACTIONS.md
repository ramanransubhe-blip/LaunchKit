# Server Actions Integration

LaunchKit features unified actions to bind form updates directly to server processing logic.

---

## Action Dispatch Example

Execute actions securely using Zod parameter validations:

```typescript
import { createApiKeyAction } from "@devlaunchkit/api";

const res = await createApiKeyAction({
  name: "Prod Token",
  scopes: ["ai:write"],
});

if (!res.success) {
  console.error(`Error: ${res.error?.message}`);
} else {
  console.log(`Generated Key: ${res.data?.key}`);
}
```
