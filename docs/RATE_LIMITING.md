# Rate Limiting & API Quotas

LaunchKit restricts request limits to avoid system exhaustion.

---

## Headers Spec

Responses inject limit metrics into HTTP headers:

- `X-RateLimit-Limit`: Maximum requests allowed per window.
- `X-RateLimit-Remaining`: Requests remaining in current window.
- `X-RateLimit-Reset`: Timestamp when window resets.
