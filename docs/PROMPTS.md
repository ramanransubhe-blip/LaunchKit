# Prompt Management

Guidelines to manage prompt templates, variable interpolation, and system instructions.

---

## Defining Templates

Create reusable templates using standard string interpolation:

```typescript
const summarizeTemplate = (text: string) => `
Summarize the following text in less than 3 sentences:
---
${text}
---
`;
```

---

## Reusable System Prompts

Inject system instructions to enforce boundaries:

```typescript
const result = await ai.generateText(prompt, {
  systemPrompt: "You are a professional assistant. Do not answer questions about other companies.",
});
```
