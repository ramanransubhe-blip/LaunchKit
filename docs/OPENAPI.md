# OpenAPI Specifications

LaunchKit features automatic OpenAPI schema discovery.

---

## Route Mappings

All REST endpoints map to `/api/v1/*` resources:

- `POST /api/v1/auth/login` — authenticate credentials.
- `POST /api/v1/billing/checkout` — generate checkout page links.
- `POST /api/v1/ai/generate` — prompt text generation.
- `POST /api/v1/storage/upload` — stream binary files.
- `POST /api/v1/communication/email` — dispatch transactional mail.
