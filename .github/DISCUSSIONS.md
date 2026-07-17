# GitHub Discussions Guide

GitHub Discussions is our primary forum for open-ended conversations, questions, and community-driven decision-making. Unlike Issues (which track actionable work), Discussions are for dialogue, brainstorming, and knowledge sharing.

**Link:** [github.com/devlaunchkit/devlaunchkit/discussions](https://github.com/devlaunchkit/devlaunchkit/discussions)

---

## Categories

### 📢 Announcements

**Purpose:** Official project announcements from the core team.

**What goes here:**

- Release announcements and changelogs
- Major project milestones and roadmap updates
- Governance changes and policy updates
- Community event announcements (office hours, meetups, conferences)
- Security advisories and important notices

**Who can post:** Maintainers only. Community members can comment and react.

**Guidelines:**

- Check this category regularly to stay informed about project developments
- Use reactions (🎉, 👍, ❤️) to show support for releases and milestones
- Questions about announcements should be asked as comments on the announcement thread, not as separate discussions

---

### ❓ Q&A

**Purpose:** Get help with DevLaunchKit setup, configuration, and usage.

**What goes here:**

- "How do I…" questions about using DevLaunchKit features
- Configuration and environment setup help
- Debugging assistance when you are unsure if something is a bug
- Best practice questions for specific use cases
- Integration questions (connecting DevLaunchKit with other tools)

**Who can post:** Anyone.

**Guidelines:**

- **Search first** — Your question may already be answered in an existing discussion or in the [FAQ](https://github.com/devlaunchkit/devlaunchkit/blob/main/docs/FAQ.md)
- **Be specific** — Include your environment details, relevant configuration, and what you have already tried
- **Mark answers** — If someone solves your problem, mark their reply as the accepted answer so others can find it
- **Share your solution** — If you solve it yourself, post the answer for future searchers
- If your question reveals a confirmed bug, a maintainer will convert it to an Issue

**Example topics:**

- "How do I configure OAuth with a custom domain?"
- "What is the recommended way to add a new payment provider?"
- "My Drizzle migrations fail on PostgreSQL 16 — is this expected?"

---

### 💡 Ideas

**Purpose:** Propose new features, suggest improvements, and discuss the project's future direction.

**What goes here:**

- Feature proposals and enhancement suggestions
- RFC drafts before formal submission (see [Governance](https://github.com/devlaunchkit/devlaunchkit/blob/main/docs/GOVERNANCE.md))
- Architectural improvement discussions
- Workflow and developer experience suggestions
- Integration ideas with third-party services

**Who can post:** Anyone.

**Guidelines:**

- **Explain the problem first** — Start with the pain point or use case, not just the solution
- **Be open to alternatives** — The community or maintainers may suggest a different approach that achieves the same goal
- **Upvote existing ideas** — If someone has already proposed what you want, upvote and comment instead of creating a duplicate
- **Use the RFC template** — For substantial proposals, follow the [RFC process](https://github.com/devlaunchkit/devlaunchkit/blob/main/docs/GOVERNANCE.md#rfc-process)
- Popular ideas with community support are prioritized for the roadmap

**Example topics:**

- "Proposal: Add multi-tenancy support with workspace isolation"
- "Idea: Built-in A/B testing framework for feature flags"
- "RFC Draft: Replace Winston with Pino for structured logging"

---

### 🎉 Show & Tell

**Purpose:** Share what you have built with DevLaunchKit, celebrate launches, and inspire the community.

**What goes here:**

- Projects, products, and apps built with DevLaunchKit
- Plugins, extensions, or packages that extend DevLaunchKit
- Blog posts, tutorials, and videos about DevLaunchKit
- Conference talks and workshop recordings
- Creative or unusual use cases
- Milestone celebrations (first deploy, first customer, launch day)

**Who can post:** Anyone.

**Guidelines:**

- **Include a link or screenshot** — Show us what you built
- **Share your experience** — What went well? What was challenging? What would you improve?
- **Be supportive** — Celebrate others' work with reactions and constructive comments
- **Credit the community** — If someone helped you, tag them
- Posts here may be featured in the monthly community spotlight or on the project website

**Example topics:**

- "Launched my SaaS with DevLaunchKit — here's how it went"
- "I built a DevLaunchKit plugin for Plausible Analytics"
- "Video tutorial: Setting up multi-tenant auth with DevLaunchKit"

---

### 💬 General

**Purpose:** Open-ended conversation that does not fit neatly into the other categories.

**What goes here:**

- Community introductions ("Hello, I'm new here!")
- Career discussions related to the DevLaunchKit ecosystem
- Meta-discussions about the community, governance, or processes
- Feedback on the contribution experience
- Cross-project collaboration opportunities
- Anything else that does not fit into Announcements, Q&A, Ideas, or Show & Tell

**Who can post:** Anyone.

**Guidelines:**

- **Be welcoming** — This is where newcomers often land first; make them feel at home
- **Stay constructive** — Keep conversations productive and respectful
- **Use other categories when appropriate** — If your post is clearly a question, idea, or showcase, post it in the right category
- Follow the [Code of Conduct](https://github.com/devlaunchkit/devlaunchkit/blob/main/CODE_OF_CONDUCT.md) at all times

**Example topics:**

- "Hi! I'm a backend developer exploring DevLaunchKit for my next project"
- "Feedback on my first contribution experience"
- "Anyone attending ReactConf and want to meet up?"

---

## Best Practices

### For Everyone

1. **Search before posting** — Avoid duplicates by searching existing Discussions and Issues first
2. **Use descriptive titles** — A clear title helps others find your discussion and increases engagement
3. **Stay on topic** — Keep discussions focused; start a new thread for tangential topics
4. **Be patient** — Not everyone is in the same time zone; allow time for responses
5. **Follow up** — If your question is resolved, mark the answer and share any additional context

### For Maintainers

1. **Respond promptly** — Aim to acknowledge new Q&A posts within 3 business days
2. **Convert when appropriate** — Promote Discussions to Issues when they reveal actionable bugs or accepted feature requests
3. **Pin important threads** — Keep frequently referenced discussions pinned for visibility
4. **Lock resolved threads** — Lock long-resolved discussions to prevent stale comments
5. **Label discussions** — Apply labels like `rfc`, `resolved`, or `needs-info` for organization

---

## Linking Discussions and Issues

| Scenario                                  | Action                                                   |
| :---------------------------------------- | :------------------------------------------------------- |
| A Discussion reveals a confirmed bug      | Maintainer converts it to an Issue with the `bug` label  |
| A Discussion proposes an accepted feature | Maintainer creates an Issue and links the Discussion     |
| An Issue needs broader input              | Maintainer creates a Discussion and references the Issue |
| A Discussion is resolved                  | Mark the answer and optionally lock the thread           |

---

## Getting Started

1. Visit [GitHub Discussions](https://github.com/devlaunchkit/devlaunchkit/discussions)
2. Browse existing categories to see what the community is talking about
3. Introduce yourself in the **General** category
4. Ask your first question in **Q&A** or share an idea in **Ideas**
5. Star the repository to stay updated on new announcements

We look forward to hearing from you!
