# Release Verification Checklist

Perform these verification checks before tagging production releases:

---

## Code Quality Check
- Run `pnpm verify` to check type safety, code formats, and build exports.
- Verify zero warnings or console errors are emitted on server start.

---

## Providers Check
- Confirm mock fallbacks are default-configured for local developer runs.
- Run unit test suites to confirm no third-party integrations crash.

---

## Package Exports Check
- Verify CLI command `devlaunchkit doctor` runs correctly.
- Verify standalone Dockerfile compiles cleanly.
