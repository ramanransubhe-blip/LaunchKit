# Transactional Email Dispatch

Transactional emails are dispatched using the unified `CommunicationService`:

---

## Send Email Options

To send an email:

```typescript
import { getGlobalCommunicationService } from "@devlaunchkit/communication";

const comm = getGlobalCommunicationService();
await comm.sendEmail(
  "test@user.com",
  "Welcome aboard",
  "welcome_email",
  { username: "LaunchKitUser" }
);
```
