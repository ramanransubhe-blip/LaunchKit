## Description

<!-- Provide a clear and concise description of this pull request. Explain the "why" behind your changes — what problem does this solve? What is the context a reviewer needs to understand your approach? -->



### Related Issues

<!-- Link to the issue(s) this PR addresses. Use "Fixes #123" to auto-close issues on merge, or "Relates to #123" for related context. -->

Fixes #

---

## Type of Change

<!-- Check all that apply. -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test update (adding or correcting tests, no production code change)
- [ ] 🔧 Build / CI / DevOps configuration change
- [ ] 🔒 Security fix or improvement

---

## Breaking Changes

<!-- If this PR introduces breaking changes, describe them here. Include migration instructions for existing users. If no breaking changes, delete this section. -->

**Breaking change description:**


**Migration steps:**

1.

---

## Screenshots / Recordings

<!-- For UI changes, include before/after screenshots or a short screen recording. For API changes, include example request/response payloads. Delete this section if not applicable. -->

| Before | After |
| :--- | :--- |
| <!-- screenshot --> | <!-- screenshot --> |

---

## Testing Checklist

<!-- Verify that your changes are thoroughly tested. Check all that apply. -->

- [ ] All existing tests pass locally (`pnpm test`)
- [ ] New unit tests added for changed/added functionality
- [ ] Integration tests pass across affected packages
- [ ] E2E tests pass for user-facing workflow changes (`pnpm test:e2e`)
- [ ] Manual testing performed and verified (describe below if applicable)
- [ ] Edge cases and error scenarios are covered
- [ ] Tests pass in CI pipeline

### Manual Testing Steps

<!-- If manual testing was performed, describe the steps so reviewers can verify. Delete if not applicable. -->

1.

---

## Quality Checklist

<!-- Confirm that your code meets our quality standards. -->

- [ ] Code follows the project style guide and passes linter checks (`pnpm lint`)
- [ ] Build completes successfully (`pnpm build`)
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] No unnecessary dependencies introduced
- [ ] Sensitive data is not logged or exposed in error messages
- [ ] Input validation applied to user-supplied data where applicable
- [ ] JSDoc/TSDoc comments added for exported functions and types

---

## Documentation

<!-- Check all that apply. -->

- [ ] Documentation has been updated to reflect the changes
- [ ] API documentation is accurate for any public API changes
- [ ] README or relevant guide has been updated
- [ ] No documentation changes needed (internal refactor only)

---

## Deployment Notes

<!-- Describe any deployment considerations, such as required environment variables, database migrations, feature flag configurations, or infrastructure changes. Delete if not applicable. -->

- **Environment variables:** None / `NEW_VAR_NAME` — description
- **Database migrations:** None / Migration included in this PR
- **Feature flags:** None / Feature gated behind `flag-name`
- **Infrastructure changes:** None / Describe changes

---

## Reviewer Guidelines

<!-- Help reviewers focus their attention. -->

**Key files to review:**
-

**Areas of concern:**
-

**Context for reviewers:**
<!-- Any design decisions, trade-offs, or alternatives you considered that would help the reviewer understand your approach. -->
