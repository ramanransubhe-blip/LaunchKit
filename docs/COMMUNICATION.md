# Communication Guide

Configuring and using the provider-agnostic Communications and Notification Platform.

---

## Purpose

This document explains the architecture of `@devlaunchkit/communication` and `@devlaunchkit/emails`, covering Resend and Postmark integration, custom React Email compilation, and dispatching in-app alerts and email dispatches.

## Prerequisites

- Resend API key or Postmark token
- Domain verified with your selected email provider

---

## Communications & Email Architecture

DevLaunchKit isolates messaging services using `@devlaunchkit/communication` and provides templates in `@devlaunchkit/emails`:

```
┌─────────────────────────┐
│ apps/web / queues / jobs│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ @devlaunchkit/          │
│ communication           │
└──────┬───────────┬──────┘
       │           │
       ▼           ▼
   [Resend]   [Postmark]
```

---

## Provider Setup

### 1. Resend Configuration (Default)

Resend is a developer-focused email platform built for modern web applications.

1. Sign up on [Resend](https://resend.com) and verify your sender domain.
2. Add your API key to `.env`:
   ```env
   RESEND_API_KEY=re_1234567890abcdef
   ```

### 2. Postmark Configuration

Postmark is known for extremely fast and reliable transactional email delivery.

1. Add your Postmark Server Token to `.env`:
   ```env
   POSTMARK_SERVER_TOKEN=your_postmark_token
   ```
2. When the Postmark token is detected, DevLaunchKit switches its active mailer client to the Postmark adapter.

---

## Usage Examples

### 1. Dispatching Transactional React Emails

```typescript
import { communication } from "@devlaunchkit/communication";
import { WelcomeEmail } from "@devlaunchkit/emails";

await communication.sendEmail({
  to: "developer@example.com",
  subject: "Welcome to DevLaunchKit!",
  react: WelcomeEmail({ name: "Alex" }),
});
console.log("Email sent successfully!");
```

### 2. Dispatches System Notifications

```typescript
import { communication } from "@devlaunchkit/communication";

await communication.sendSystemNotification({
  channel: "slack",
  title: "New Subscription Added",
  message: "User Alex has signed up for the Pro Plan ($29/mo).",
  level: "info",
});
```

---

## Screenshots Placeholder

![React Email Preview In Browser](/assets/storage_platform.png)
_Visual layout of the default transactional Welcome Email template._

---

## Best Practices

- **Queue Email Sends**: Avoid sending emails synchronously during HTTP requests. Instead, push email jobs to `@devlaunchkit/queue` using BullMQ, letting background workers process the sends asynchronously.
- **Double-Verify Sender Domains**: Ensure DKIM, SPF, and DMARC settings are fully configured on your DNS provider before publishing live client mailers.

## Common Mistakes

- **Sending from Unverified Domains**: Attempting to send transactional emails from `@example.com` or `@gmail.com` using Resend, which causes email deliveries to be blocked or automatically filtered to spam.
- **Leaking API keys in templates**: Hardcoding API secrets or server overrides inside React Email component code.

---

## Troubleshooting

- **Resend validation error (Status 422)**:
  - Verify that the `from` email address domain matches the verified domain in your Resend account dashboard.
- **BullMQ email job stalling**:
  - Make sure your local Redis container is running (`docker-compose up -d`) to support the queue worker processes.
