name: ❓ Question
description: Ask a question about DevLaunchKit usage, configuration, or best practices.
labels: [question, triage]
body:

- type: markdown
  attributes:
  value: |
  Thanks for reaching out! Before submitting, please check: - 📖 [FAQ](https://github.com/devlaunchkit/devlaunchkit/blob/main/docs/FAQ.md) - 🔍 [Troubleshooting Guide](https://github.com/devlaunchkit/devlaunchkit/blob/main/docs/TROUBLESHOOTING.md) - 💬 [GitHub Discussions](https://github.com/devlaunchkit/devlaunchkit/discussions) — your question may already be answered - 🗨️ [Discord](https://discord.gg/devlaunchkit) — for real-time help

      For general how-to questions, consider using **GitHub Discussions** instead of Issues.

- type: textarea
  id: question
  attributes:
  label: Your Question
  description: Describe your question clearly and provide enough context for someone to help you.
  placeholder: |
  What I'm trying to do:
  ...

      What I've tried so far:
      ...

      Where I'm stuck:
      ...

  validations:
  required: true

- type: dropdown
  id: area
  attributes:
  label: Related Area
  description: Which part of DevLaunchKit does this relate to?
  options: - Authentication (auth, middleware, permissions) - Database (database, migrations, ORM) - API (api, routes, server actions) - UI Components (ui, hooks, design system) - Payments (payments, billing, subscriptions) - AI & Search (ai, search, embeddings) - DevOps & CI/CD (deployment, Docker, GitHub Actions) - Configuration (env, config, constants) - Testing (testing, vitest, playwright) - CLI (cli, scaffolding) - Other / Not sure
  validations:
  required: true
- type: textarea
  id: context
  attributes:
  label: Additional Context
  description: Include any relevant code snippets, configuration, error messages, or screenshots.
  placeholder: Paste code, error output, or attach screenshots here...
  validations:
  required: false
- type: textarea
  id: environment
  attributes:
  label: Environment
  description: Provide your environment details if relevant to the question.
  placeholder: | - OS: Windows 11 / macOS 15 / Ubuntu 24.04 - Node.js: v20.x - pnpm: v9.x - DevLaunchKit version: v1.x.x
  validations:
  required: false
