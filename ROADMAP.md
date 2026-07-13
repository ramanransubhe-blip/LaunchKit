# Public Product Roadmap

A comprehensive view of past milestones and upcoming feature schedules for DevLaunchKit.

---

## 📍 v1.0 — Core Platform (Completed - Current)
- **Monorepo Architecture**: Decoupled package structure using Turborepo and pnpm workspaces.
- **Next.js 15 Web Portal**: Showcasing server action integrations, responsive dashboards, and organization management.
- **Provider Decoupling**: Provider-agnostic wrappers for:
  - **Authentication**: Better Auth & Clerk.
  - **Billing & Payments**: Dodo Payments & Stripe.
  - **AI Gateway**: OpenAI, Anthropic Claude, & Google Gemini.
  - **File Storage**: AWS S3 & Supabase Storage.
  - **Communication**: Resend SMTP.
- **Command-Line Interface**: CLI tool with `create`, `add`, and `doctor` system validation commands.
- **Ops Console**: Business operations panel with user management, flag controllers, and audit logging.

---

## 📍 v1.1 — Quality Gates & E2E (Target Q3 2026)
- **Testing Coverage**:
  - Playwright E2E browser test suites covering authentication and team invitation flows.
  - Vitest integration tests for API router endpoints.
  - MSW mocking configs for external API networks isolation.
- **Visual Regressions**: Automatic screenshot comparison checks in CI/CD pipeline to flag layout shifts.
- **Accessibility Hardening**: Automatic Lighthouse and pa11y scans enforced in pull requests.

---

## 📍 v1.2 — Edge Runtime Optimizations (Target Q4 2026)
- **Edge DB Queries**: Native support for Cloudflare Hyperdrive / Supabase connection pooling over Edge functions.
- **Bundle Auditing**: Automatic bundle analyzer checks running on pull requests, blocking PRs exceeding weight thresholds.
- **Cache Layers**: Redis Upstash edge caching wrappers for fast global data retrievals.

---

## 📍 v2.0 — Enterprise Scaling (Target Q1 2027)
- **SAML SSO / SCIM**: Enterprise SSO directories syncing integrations via Clerk and Better Auth enterprise add-ons.
- **Seat-based billing ledger**: Usage-based billing ledger tracking API calls and workspace seats automatically in Stripe.
- **Multi-region DB replication**: Read replicas routing utilities for fast local DB reads.

