# Observability & Metrics Logging

DevLaunchKit records token logs and costs for every AI interaction.

---

## Logging Metrics

Each result block returns execution stats:

```typescript
const result = await ai.generateText("Write content");
console.log(`Model: ${result.model}`);
console.log(`Prompt tokens: ${result.usage.promptTokens}`);
console.log(`Completion tokens: ${result.usage.completionTokens}`);
console.log(`Estimated Cost: $${result.cost}`);
```
