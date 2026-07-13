# API Versioning Guidelines

LaunchKit version namespacing targets `/api/v1/*` configurations:

---

## Route Namespaces

```text
/api/v1/auth/*
/api/v1/billing/*
/api/v1/ai/*
/api/v1/storage/*
/api/v1/communication/*
```

Deprecation policies involve injecting `X-API-Deprecation` warning headers into responses.
