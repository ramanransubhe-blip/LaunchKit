name: 🐛 Bug Report
description: Report a bug or issue in the application to help us improve.
labels: [bug, triage]
body:

- type: markdown
  attributes:
  value: |
  Please fill out this form as accurately as possible to help us triage the issue.
- type: textarea
  id: description
  attributes:
  label: Bug Description
  description: Provide a clear and concise description of the bug.
  placeholder: Describe what went wrong...
  validations:
  required: true
- type: textarea
  id: reproduction
  attributes:
  label: Steps to Reproduce
  description: Explain how we can reproduce this behavior.
  placeholder: | 1. Run pnpm dev 2. Click on Admin page 3. See error
  validations:
  required: true
- type: textarea
  id: expected
  attributes:
  label: Expected Behavior
  description: Describe what you expected to happen.
  placeholder: What should have happened instead?
  validations:
  required: true
- type: dropdown
  id: environment
  attributes:
  label: Environment Info
  description: Where are you experiencing this issue?
  options: - Local Development (Node.js) - Docker Container - Production Deployment - Edge Runtime
  validations:
  required: true
