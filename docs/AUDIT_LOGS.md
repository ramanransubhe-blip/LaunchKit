# Audit Trail & Timeline Logging

All administrative actions (modifying subscriptions, suspending profiles, toggle flags) are stored in an audit database table:

---

## Log Fields

- `id`: unique record reference.
- `actorId`: admin user who performed the operation.
- `action`: event classification (e.g. `USER_SUSPENDED`).
- `metadata`: payload details before/after properties changes.
