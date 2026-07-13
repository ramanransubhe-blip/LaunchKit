# Security & Hardening Guide

Securing Next.js applications, encrypting keys, and setting rate limits.

---

## Purpose
This document provides security practices and hardening guidelines for DevLaunchKit, detailing threat mitigation steps, secure headers configuration, rate-limiting, and encryption procedures.

## Prerequisites
- Basic understanding of web security concepts (OWASP Top 10)
- Production environment access for configuring headers and variables

---

## Security Architecture

DevLaunchKit applies security layers across every transaction point:

```
[User Request] ──► [Next.js Middleware CORS / CSP] ──► [Redis Rate Limiter] ──► [Auth ABAC Guard] ──► [Sanitizer / DB]
```

---

## Hardening Configurations

### 1. Content Security Policy (CSP)
Configure your Content Security Policy inside `packages/middleware/src/security.ts` to restrict where scripts, styles, and fonts can load from:

```typescript
// Example CSP Header values
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://your-supabase-id.supabase.co;
  font-src 'self' data:;
  connect-src 'self' https://api.stripe.com;
`;
```

### 2. Encryption Key Rotation
Sensitive information (like user tokens and integration keys) are encrypted inside the database using the AES-256-GCM wrapper from `@devlaunchkit/security`:

To rotate keys safely in production:
1. Generate a new key: `openssl rand -hex 32`
2. Add it to `ENCRYPTION_KEY_NEW` inside `.env`.
3. Run the CLI key-migration script:
   ```bash
   pnpm --filter @devlaunchkit/security migrate-keys
   ```
4. Update `ENCRYPTION_KEY` to the new value and delete the old key.

---

## Screenshots Placeholder
![Security Scan Audit logs](/assets/storage_platform.png)
*CLI auditing tool displaying zero vulnerability warnings after security check runs.*

---

## Best Practices
- **Rotate secrets quarterly**: Keep a regular schedule for rotating API keys, database passwords, and session secrets.
- **Implement Strict CORS rules**: Never set CORS access to `*` on API routes. Always restrict allowed origins to your verified web app domains.
- **Sanitize HTML inputs**: Use DOMPurify or sanitize-html on the server-side before saving user-generated markdown or rich text to the database.

## Common Mistakes
- **Exposing DB connection URLs in Git commits**: Accidental commits containing database credentials or production API keys.
- **Bypassing SSL checks**: Configuring endpoints with `http` in production instead of enforcing HTTPS globally.

---

## Troubleshooting
- **CORS Blockages in production**:
  - Double check that the frontend domain (including `https://` prefix) is correctly listed in the `ALLOWED_ORIGINS` environment variable in your production hosting setup.
- **CSP blocks local scripts**:
  - During local development, you may need to add `'unsafe-eval'` to `script-src` to support Next.js hot module reloading features.
- **Authentication Session Decryption failure**:
  - This occurs if `AUTH_SECRET_KEY` is changed or mismatching. Restore the original key to recover active session decrypt capabilities.
