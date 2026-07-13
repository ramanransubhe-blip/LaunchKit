# Contributing to DevLaunchKit

Thank you for helping build DevLaunchKit! We want to make contributing as simple and transparent as possible.

---

## Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md) in all community spaces and communication channels.

---

## Branching Strategy & Workflow

We utilize a structured git branch flow for all updates:
- **`main`**: Production release branch. Only release tags and hotfix PRs target this branch.
- **`dev`**: Integration branch. All features, improvements, and standard patches must merge here.
- **`feature/your-feature-name`**: Developer workspace branch for new features.
- **`bugfix/issue-description`**: Developer workspace branch for fixing bug tickets.

### Step-by-Step Contribution Flow:
1. Fork the repository and clone it locally.
2. Create a feature branch off of the `dev` branch:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-cool-feature
   ```
3. Implement your changes, adding tests where applicable.
4. Run the local diagnostics to confirm system health:
   ```bash
   pnpm doctor
   ```
5. Ensure your code passes all lint and build quality checks:
   ```bash
   pnpm verify
   ```
6. Commit your changes using conventional messages (see below).
7. Push your branch to GitHub and open a Pull Request targeting the `dev` branch.

---

## Coding & Commit Conventions

### Conventional Commits
All commits must follow the Conventional Commits specification. This enables automated releases and changelog updates:
```
<type>(<scope>): <short description>
```

#### Supported Types:
- `feat`: A new feature introduction (maps to minor version bump).
- `fix`: A bug fix patch (maps to patch version bump).
- `docs`: Documentation files updates.
- `style`: Changes that do not affect code logic (formatting, spacing).
- `refactor`: Code changes that neither fix bugs nor add features.
- `test`: Adding or modifying tests.
- `chore`: Infrastructure updates, package configs, or release scripts.

#### Examples:
- `feat(auth): add magic link sign-in adapter`
- `fix(billing): verify webhook signature header correctly`
- `docs(monorepo): document turborepo tasks pipelines`

---

## Pull Request Guidelines

Before opening a PR, check off the following quality gates checklist:
- [ ] Code compiles without errors: `pnpm build`
- [ ] Linter rules pass cleanly: `pnpm lint`
- [ ] Strict typechecks pass: `pnpm typecheck`
- [ ] All unit and integration tests pass: `pnpm test`
- [ ] PR description details the changes, context, and verification steps.
- [ ] Target branch is set to `dev`.
