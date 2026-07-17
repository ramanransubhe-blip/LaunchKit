# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-13

### Added

- **Monorepo Structure**: Fully configured Turborepo workspaces using `pnpm`.
- **Next.js 15 Web Portal**: Core SaaS interface with user dashboards, account profile editors, dark mode, and command palettes.
- **Provider-Agnostic Core**: Decoupled package wrappers supporting:
  - Better Auth & Clerk for authentication.
  - Dodo Payments & Stripe for payment gateways.
  - OpenAI, Anthropic, & Google Gemini for LLM completions.
  - AWS S3 & Supabase Storage for file storage.
  - Resend SMTP for email notifications.
- **Command-Line Interface**: CLI tool with `create`, `add`, and `doctor` system validation checks.
- **Operations Console**: Built-in administration panels for user role management, Gradual feature flag rollouts, and audit logging.
- **GitHub Workflows CI/CD**: Automatic pipelines for typechecks, linter checks, vitest runs, and semantic releases.
- **Documentation Center**: 23 comprehensive markdown documents detailing monorepo configurations, APIs, and setups.
- **Runnable Templates**: 7 example projects showing platform integrations.
