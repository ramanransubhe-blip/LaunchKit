name: 🔒 Security Report
description: Report a security vulnerability. For responsible disclosure, please email us directly instead.
labels: [security]
body:

- type: markdown
  attributes:
  value: | ## ⚠️ STOP — Please Read Before Proceeding

      **Do NOT use this form to report actual security vulnerabilities.**

      If you have discovered a security vulnerability in DevLaunchKit, please report it responsibly through our private disclosure channel:

      📧 **Email: [security@devlaunchkit.dev](mailto:security@devlaunchkit.dev)**

      ### Why?

      Public issue trackers are visible to everyone. Disclosing a vulnerability here could put all DevLaunchKit users at risk before a fix is available. Our security team will:

      1. **Acknowledge** your report within 24 hours
      2. **Investigate** and confirm the vulnerability
      3. **Develop and test** a fix
      4. **Release a patch** and publish a security advisory
      5. **Credit you** in the advisory (unless you prefer anonymity)

      For full details, see our [Security Policy](https://github.com/devlaunchkit/devlaunchkit/blob/main/SECURITY.md).

      ---

      **This form is only for general security-related questions that are NOT vulnerabilities** — such as questions about security best practices, hardening configurations, or security feature requests.

- type: dropdown
  id: type
  attributes:
  label: Type of Report
  description: Select what this report is about.
  options: - Security feature request (new security capability) - Security hardening suggestion (improve existing security) - Security documentation question (how to configure security features) - Dependency vulnerability notice (known CVE in a dependency) - Other security-related topic (not a vulnerability)
  validations:
  required: true
- type: textarea
  id: description
  attributes:
  label: Description
  description: Describe your security-related question, suggestion, or concern.
  placeholder: |
  Describe the security topic here...

      REMINDER: Do NOT include vulnerability details, exploit steps, or proof-of-concept code.
      For vulnerabilities, email security@devlaunchkit.dev instead.

  validations:
  required: true

- type: checkboxes
  id: confirmation
  attributes:
  label: Confirmation
  description: Please confirm the following before submitting.
  options: - label: This report does NOT contain details of an active security vulnerability
  required: true - label: I understand that actual vulnerabilities should be reported to security@devlaunchkit.dev
  required: true
