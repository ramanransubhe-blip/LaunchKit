# Admin & Operations Dashboard Guide

Managing users, tenant organizations, feature flags, and system telemetry.

---

## Purpose

This document provides instructions for using the DevLaunchKit Ops Admin Console, detailing role validations, organization structures administration, custom feature flag triggers, and viewing audit logs.

## Prerequisites

- User must be assigned the `SUPER_ADMIN` system role in your database
- Running Next.js application dev server locally

---

## Ops Admin Panel Architecture

The Operations Console is located at `/admin` and routes page requests through the `@devlaunchkit/permissions` guard. It runs under strict server-side authentication:

```
                  ┌──────────────────────┐
                  │   /admin/dashboard   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ @devlaunchkit/       │
                  │ permissions guard    │
                  └──────────┬───────────┘
                             │
           ┌─────────────────┴─────────────────┐
           ▼                                   ▼
    [SUPER_ADMIN]                      [STANDARD_USER]
    Access Granted                     Redirect to /dashboard
```

---

## Console Features

### 1. User & Roles Management

The `/admin/users` interface allows you to:

- View all registered users across tenant organizations.
- Elevate users to system roles (`STANDARD_USER`, `ADMIN`, `SUPER_ADMIN`).
- Deactivate users or force MFA resets.

### 2. Feature Flags Administration

Manage flags at `/admin/feature-flags` with support for:

- **Boolean flags**: Toggle features globally.
- **Gradual rollouts**: Roll out features to a percentage of users (e.g. 10%, 25%, 100%).
- **Targeted releases**: Enable flags for specific users or organizations.

### 3. Audit Logs

Audit logging is managed under `packages/logger` and synchronized to the database `audit_logs` table. Every administrative action (role change, billing override, or flag toggle) writes an entry:

```typescript
import { logger } from "@devlaunchkit/logger";

await logger.audit({
  actorId: "user_admin_101",
  action: "feature_flag.update",
  targetId: "flag_multitenant_mode",
  metadata: { oldValue: false, newValue: true },
});
```

---

## Screenshots Placeholder

![Operations Dashboard Telemetry Screens](/assets/admin_panel.png)
_Admin panel dashboard rendering database stats, active users, and system health charts._

---

## Best Practices

- **Never grant SUPER_ADMIN lightly**: Keep the number of super administrators as low as possible. Use organization-specific roles (e.g., Owner, Member) for regular administration.
- **Review Audit Logs regularly**: Set up alerts for sensitive actions like manual database overrides or deletion of organization files.

## Common Mistakes

- **Leaking flags in client components**: Evaluating feature flags on the frontend without passing a fallback state. This leads to layout shifts if flag checking is slow.
- **Bypassing the Permissions Guard**: Adding custom routes under `/admin/` without applying the `@devlaunchkit/permissions` middleware, leaving directories unprotected.

---

## Troubleshooting

- **Cannot access `/admin` (Redirect Loop)**:
  - Verify that your user row in the database has the `role` field set to `SUPER_ADMIN`.
  - Run the database seed script to make sure the standard roles schema is registered.
- **Feature flag updates not reflecting in the application**:
  - Clear your browser's local cache or click "Clear Cache" in the flags dashboard, as flag checks are cached in memory for 60 seconds to optimize page loading times.
