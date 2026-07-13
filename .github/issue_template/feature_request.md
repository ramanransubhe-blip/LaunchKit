name: 💡 Feature Request
description: Propose a new feature, enhancement, or architectural improvement.
labels: [enhancement, feature]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: Is your feature request related to a problem? Please describe.
      placeholder: Describe the problem or challenge you're facing...
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed Solution
      description: Describe the solution or feature you'd like to propose.
      placeholder: Describe how the new feature should work...
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternative Solutions Considered
      description: Outline any other approaches or workarounds you've thought of.
      placeholder: What other solutions did you explore?
    validations:
      required: false
