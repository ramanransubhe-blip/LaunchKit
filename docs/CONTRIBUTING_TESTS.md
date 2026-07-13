# Contributing Tests

We require all pull requests to contain comprehensive tests.

---

## Guidelines

1.  **Unit Tests**: Locate them inside `tests/` relative to the package workspace.
2.  **Mocks**: Always use mock integrations to ensure tests run offline.
3.  **Assertion Quality**: Assert exact return shapes, avoiding broad matches.
