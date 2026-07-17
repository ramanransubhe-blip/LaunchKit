# Maintainer Guidelines

This document defines the operational practices, responsibilities, and processes for DevLaunchKit maintainers. All core team members are expected to follow these guidelines.

---

## Core Team

| Name           | GitHub Handle  | Primary Area                  | Time Zone      |
| :------------- | :------------- | :---------------------------- | :------------- |
| Raman Ransubhe | @ramanransubhe | Project Lead, Architecture    | IST (UTC+5:30) |
| Sarah Chen     | @sarahchen     | Auth, Payments, Security      | PST (UTC−8)    |
| Marcus Webb    | @marcuswebb    | Database, API, Infrastructure | EST (UTC−5)    |
| Anika Patel    | @anikapatel    | UI, Design System, Frontend   | GMT (UTC+0)    |
| Tomás Rivera   | @tomasrivera   | DevOps, CI/CD, Observability  | CET (UTC+1)    |
| Yuki Tanaka    | @yukitanaka    | AI, Search, Queue Systems     | JST (UTC+9)    |

---

## Issue Triaging

All new issues must be triaged within **5 business days** of creation. Triaging means assigning labels, priority, and an owner.

### Triaging Workflow

1. **Verify the report** — Confirm the issue is reproducible or the request is actionable
2. **Check for duplicates** — Search existing issues and link duplicates with a `duplicate` label
3. **Assign labels** — Apply the appropriate labels from the table below
4. **Set priority** — Assign a priority label based on impact and urgency
5. **Assign an owner** — Route the issue to the appropriate area owner (see Code Ownership)
6. **Communicate** — Leave a comment acknowledging the issue and next steps

### Priority Labels

| Label                | Meaning                                                       | Response Target |
| :------------------- | :------------------------------------------------------------ | :-------------- |
| `priority: critical` | Security vulnerability, data loss, or complete service outage | Same day        |
| `priority: high`     | Major feature broken, blocking significant workflows          | Within 48 hours |
| `priority: medium`   | Non-blocking bug or important enhancement                     | Within 1 week   |
| `priority: low`      | Minor cosmetic issue, nice-to-have improvement                | Best effort     |

### Category Labels

| Label                | Description                                      |
| :------------------- | :----------------------------------------------- |
| `bug`                | Confirmed defect in existing functionality       |
| `feature`            | New capability request                           |
| `documentation`      | Documentation improvement or correction          |
| `performance`        | Performance regression or optimization           |
| `security`           | Security-related issue (handle with care)        |
| `breaking-change`    | Requires a major version bump                    |
| `good first issue`   | Suitable for new contributors                    |
| `help wanted`        | Core team needs community assistance             |
| `needs-reproduction` | Awaiting a minimal reproduction case             |
| `needs-design`       | Requires design discussion before implementation |

---

## Pull Request Review Checklist

Every PR must be reviewed by at least **one core team member** from the relevant area. Use this checklist during reviews:

### Code Quality

- [ ] Code follows the project style guide and passes all linter checks
- [ ] No unnecessary dependencies are introduced
- [ ] Functions and variables have clear, descriptive names
- [ ] Complex logic includes explanatory comments
- [ ] No hardcoded secrets, API keys, or environment-specific values

### Architecture

- [ ] Changes align with the existing architecture and patterns
- [ ] New packages or modules follow the `@devlaunchkit/` namespace convention
- [ ] Database schema changes include a migration file
- [ ] API changes maintain backward compatibility or are flagged as breaking

### Testing

- [ ] New features include unit tests with meaningful assertions
- [ ] Bug fixes include a regression test that would have caught the issue
- [ ] All existing tests continue to pass (`pnpm test`)
- [ ] Integration tests cover cross-package interactions where applicable
- [ ] E2E tests are added for user-facing workflow changes

### Documentation

- [ ] Public API changes are reflected in relevant docs
- [ ] JSDoc/TSDoc comments are added for exported functions and types
- [ ] README or doc pages are updated if behavior changes
- [ ] Breaking changes are documented in the PR description

### Security

- [ ] Input validation is applied to all user-supplied data
- [ ] Authentication and authorization checks are in place for protected routes
- [ ] No sensitive data is logged or exposed in error messages
- [ ] Dependencies have been checked for known vulnerabilities

---

## Commit and Squash Guidelines

We use **squash merging** for all pull requests to maintain a clean, linear commit history on the `main` branch.

### Commit Message Format

All squash commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Usage                                                   |
| :--------- | :------------------------------------------------------ |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation-only changes                              |
| `style`    | Formatting, missing semicolons, etc. (no code change)   |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or correcting tests                              |
| `build`    | Changes to build system or external dependencies        |
| `ci`       | Changes to CI configuration files and scripts           |
| `chore`    | Other changes that don't modify `src` or `test` files   |

### Scope

Use the package name without the `@devlaunchkit/` prefix:

```
feat(auth): add OAuth2 PKCE flow support
fix(database): resolve connection pool exhaustion under load
docs(payments): add Stripe webhook setup guide
```

### Squash Merge Rules

1. The PR title becomes the squash commit message — ensure it follows the format above
2. Individual commits within a PR do not need to follow the format (they will be squashed)
3. Multi-package changes should use the most impacted package as the scope
4. Breaking changes must include `BREAKING CHANGE:` in the commit footer

---

## Release Process

DevLaunchKit follows [Semantic Versioning](https://semver.org/) (SemVer).

### Release Cadence

| Release Type        | Cadence   | Description                        |
| :------------------ | :-------- | :--------------------------------- |
| **Patch** (`x.y.Z`) | As needed | Bug fixes and security patches     |
| **Minor** (`x.Y.0`) | Bi-weekly | New features, non-breaking changes |
| **Major** (`X.0.0`) | Quarterly | Breaking changes, major redesigns  |

### Release Steps

1. **Create a release branch** from `main`:

   ```bash
   git checkout -b release/vX.Y.Z main
   ```

2. **Update version numbers** across all packages:

   ```bash
   pnpm version:bump <major|minor|patch>
   ```

3. **Generate the changelog** from conventional commits:

   ```bash
   pnpm changelog:generate
   ```

4. **Run the full test suite** and verify CI passes:

   ```bash
   pnpm test:all
   pnpm build
   pnpm lint
   ```

5. **Create a PR** from the release branch to `main` and request review from at least two core team members

6. **Merge and tag** — After approval, squash merge and create a GitHub Release with the generated changelog

7. **Publish packages** — CI automatically publishes updated packages to npm upon release tag creation

8. **Announce the release** — Post in Discord `#announcements`, update the project website, and notify enterprise customers

### Hotfix Process

For critical patches that cannot wait for the next scheduled release:

1. Branch from the latest release tag: `git checkout -b hotfix/vX.Y.Z+1 vX.Y.Z`
2. Apply the minimal fix with a regression test
3. Fast-track review with one core team member
4. Merge, tag, and publish immediately

---

## Code Ownership

Each package area has a designated owner responsible for reviewing PRs, triaging issues, and maintaining quality.

| Area                          | Packages                                                                             | Owner          |
| :---------------------------- | :----------------------------------------------------------------------------------- | :------------- |
| **Core Platform**             | `config`, `constants`, `env`, `errors`, `types`, `utils`, `validation`               | @ramanransubhe |
| **Authentication & Security** | `auth`, `middleware`, `permissions`, `security`, `rate-limit`                        | @sarahchen     |
| **Data & API**                | `database`, `api`, `cache`, `events`, `queue`                                        | @marcuswebb    |
| **Frontend & UI**             | `ui`, `hooks`, `emails`, `cli`                                                       | @anikapatel    |
| **Infrastructure & Ops**      | `observability`, `logger`, `telemetry`, `feature-flags`, `testing`                   | @tomasrivera   |
| **AI & Services**             | `ai`, `search`, `storage`, `communication`, `notifications`, `analytics`, `payments` | @yukitanaka    |
| **Apps**                      | `apps/web`, `apps/api`, `apps/admin`                                                 | @ramanransubhe |
| **Documentation**             | `docs/`, `README.md`, guides                                                         | @anikapatel    |
| **CI/CD & DevOps**            | `.github/`, `turbo.json`, `docker/`                                                  | @tomasrivera   |

### Ownership Responsibilities

- **Review PRs** within your area within 2 business days
- **Triage issues** labeled for your area within 5 business days
- **Maintain documentation** for packages you own
- **Communicate breaking changes** to the team before merging
- **Mentor contributors** working on issues in your area

---

## On-Call Rotation

The on-call maintainer is the first responder for critical issues, security reports, and community escalations during their rotation week.

### Weekly Rotation Schedule

| Week   | On-Call Primary | On-Call Secondary |
| :----- | :-------------- | :---------------- |
| Week 1 | @ramanransubhe  | @sarahchen        |
| Week 2 | @marcuswebb     | @anikapatel       |
| Week 3 | @tomasrivera    | @yukitanaka       |
| Week 4 | @sarahchen      | @ramanransubhe    |
| Week 5 | @anikapatel     | @marcuswebb       |
| Week 6 | @yukitanaka     | @tomasrivera      |

The rotation repeats every 6 weeks. Swaps are permitted with advance notice in the `#maintainers` Discord channel.

### On-Call Responsibilities

1. **Monitor notifications** — Check GitHub notifications and the `#triage` Discord channel at least twice daily
2. **Respond to critical issues** — Acknowledge within 4 hours during business hours
3. **Handle security reports** — Acknowledge receipt within 24 hours and begin assessment
4. **Escalate when needed** — Loop in the secondary on-call or area owner for domain-specific issues
5. **Write a handoff summary** — At the end of your rotation, post a summary of open items in `#maintainers`

### Handoff Template

```markdown
## On-Call Handoff — Week of [DATE]

### Open Critical Issues

- [Issue #XXX]: Brief description — current status

### Security Reports

- None / [Brief summary without sensitive details]

### Pending Decisions

- [Topic]: Context and recommended next step

### Notes for Next On-Call

- Any context the next person should know
```
