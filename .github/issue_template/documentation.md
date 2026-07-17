name: 📚 Documentation Issue
description: Report a documentation problem, request new documentation, or suggest improvements.
labels: [documentation, triage]
body:

- type: markdown
  attributes:
  value: |
  Help us improve the DevLaunchKit documentation! Whether you found an error, a missing guide, or have a suggestion for improvement, we appreciate your feedback.
- type: dropdown
  id: type
  attributes:
  label: Issue Type
  description: What kind of documentation issue is this?
  options: - Incorrect information (factual error, outdated content) - Missing documentation (undocumented feature, missing guide) - Unclear or confusing (hard to follow, needs better explanation) - Broken links or formatting (dead links, rendering issues) - Typo or grammar (spelling, punctuation, wording) - New tutorial or guide request
  validations:
  required: true
- type: textarea
  id: location
  attributes:
  label: Documentation Location
  description: Where in the docs did you find the issue? Provide a URL, file path, or page name.
  placeholder: |
  e.g., docs/AUTHENTICATION.md, Section "OAuth Setup"
  or: https://devlaunchkit.dev/docs/authentication
  validations:
  required: true
- type: textarea
  id: description
  attributes:
  label: Description
  description: Describe the problem or your suggestion in detail.
  placeholder: |
  What is wrong or missing:
  ...

      What the documentation should say or cover:
      ...

  validations:
  required: true

- type: textarea
  id: suggestion
  attributes:
  label: Suggested Improvement
  description: If you have a specific fix or improvement in mind, describe it here. Even better — consider opening a PR!
  placeholder: |
  The section should be updated to say:
  ...

      A new guide should cover:
      ...

  validations:
  required: false

- type: checkboxes
  id: contribution
  attributes:
  label: Contribution
  description: Would you be willing to help fix this?
  options: - label: I am willing to submit a pull request to fix this documentation issue
  required: false
