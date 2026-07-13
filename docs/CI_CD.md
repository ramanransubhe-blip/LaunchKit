# CI/CD Workflows

CI/CD automation is managed by GitHub Actions inside `.github/workflows/verify.yml`:

---

## PR Pipeline Steps

1.  **Checkout Code & Node Setup**: Load dependencies caching pnpm.
2.  **pnpm verify**: Run lint validations, check types, build all packages.
3.  **Docker Build**: Test standalone multi-stage containerizations.
