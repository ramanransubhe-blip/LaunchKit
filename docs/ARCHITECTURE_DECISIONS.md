# Architecture Decisions

## 1. Canonical Authentication Package

Decision: `packages/auth` is the canonical authentication abstraction for the repository.

Reasoning:

- The app should not depend on provider-specific SDKs.
- Provider changes should be configuration-driven where possible.
- Authentication needs to be reusable across applications, not embedded in the Next.js app.

## 2. Provider SDKs Stay Behind Adapters

Decision: Better Auth and Clerk integrations live behind provider-local adapters.

Reasoning:

- Provider-specific types should not leak into application code.
- A narrow adapter boundary makes later provider swaps cheaper and safer.
- It keeps the public package API stable even if provider SDKs change.

## 3. Auth Package Owns Cross-Cutting Concerns

Decision: security, permissions, middleware, server helpers, hooks, and client helpers live together in the auth package.

Reasoning:

- Authentication is not just login and logout.
- Authorization, session management, and client state are part of the same domain boundary.
- A single package keeps the abstraction coherent for contributors.

## 4. Password and Token Handling

Decision: use modern hashing and opaque/signed token helpers inside the auth package.

Reasoning:

- Authentication secrets should not be stored in plain text.
- Raw tokens should be hashed when persistence is required.
- Security primitives should be reusable by provider implementations and tests.

## 5. Compatibility Facade for `@devlaunchkit/types`

Decision: `packages/types` will re-export canonical auth types from `packages/auth`.

Reasoning:

- It preserves a stable import path for any existing code.
- It removes the duplicated auth type source of truth.
- Future changes to auth contracts stay centralized.
