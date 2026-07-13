# Release Operations Guide

Versioning, release tagging, and automated changelogs generation.

---

## Purpose
This document provides instructions for publishing and tagging new versions of DevLaunchKit, outlining Semantic Versioning, git release tagging workflows, and CI/CD automated release configurations.

## Prerequisites
- Maintainer access to the GitHub repository
- GPG key configured for signing releases

---

## Versioning Policy

DevLaunchKit adheres strictly to [Semantic Versioning (SemVer) 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
  │     │     └─ Patch version: backward-compatible bug fixes
  │     └─────── Minor version: backward-compatible new features
  └───────────── Major version: incompatible API changes (breaking updates)
```

---

## Git Tagging Release Workflow

When tagging a new public release, follow these steps:

### 1. Merge all changes to `main`
Ensure your local branch is fully up to date and clean:
```bash
git checkout main
git pull origin main
```

### 2. Verify all quality gates pass
Run linting, typechecks, and test suites across the monorepo:
```bash
pnpm verify
```

### 3. Create a Signed Git Tag
Tag the commit with your new version number and sign it:
```bash
git tag -s v1.0.0 -m "Release DevLaunchKit v1.0.0"
```

### 4. Push the Tag to GitHub
```bash
git push origin v1.0.0
```
This automatically triggers our `.github/workflows/release.yml` CI/CD pipeline, publishing package updates and generating the release notes.

---

## Automated Changelogs

Changelog updates are managed via standard Conventional Commits.
By formatting commits with prefixes:
- `feat: ...` (maps to Minor version increment)
- `fix: ...` (maps to Patch version increment)
- `feat!: ...` or listing `BREAKING CHANGE:` in footer (maps to Major version increment)

Our CI/CD pipeline will automatically run semantic-release to bump package versions, update `CHANGELOG.md`, and publish a GitHub Release with compiled release notes.

---

## Screenshots Placeholder
![GitHub Releases Page Overview](/assets/readme_illustration.png)
*GitHub release dashboard showing tagged version, commits summaries, and release files assets.*

---

## Best Practices
- **Sign all release tags**: GPG signing guarantees that the release is authentic, preventing supply chain attacks.
- **Run dry-runs first**: Verify release outputs locally before running pushes:
  ```bash
  npx semantic-release --dry-run
  ```

## Common Mistakes
- **Pushing tags with untracked edits**: Tagging a commit that contains local modifications or uncommitted changes.
- **Skipping conventional prefixes**: Writing plain commit messages like "fixed bug" or "updated docs" which breaks semantic versioning parse tools.

---

## Troubleshooting
- **GitHub Action Release Job Fails**:
  - Verify that the `GITHUB_TOKEN` secret has write permissions enabled in your repository's actions settings.
  - Verify that GPG signature checks are configured correctly if your repository requires signed commits.
- **Changelog contains duplicate items**:
  - Clean squash commit histories when merging PRs to prevent duplicate commits from entering the main branch.
