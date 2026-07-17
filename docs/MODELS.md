# Model Configurations & Management

DevLaunchKit maps pricing configurations and default models for each provider:

---

## Provider Model Defaults

| Provider             | Default Model                | Token Pricing                           |
| :------------------- | :--------------------------- | :-------------------------------------- |
| **OpenAI**           | `gpt-4o`                     | $5.00 / M prompt, $15.00 / M completion |
| **Google Gemini**    | `gemini-1.5-flash`           | $0.075 / M prompt, $0.30 / M completion |
| **Anthropic Claude** | `claude-3-5-sonnet-20241022` | $3.00 / M prompt, $15.00 / M completion |

---

## Dynamic Selection

Change models on the fly by passing `options.model`:

```typescript
const ai = getGlobalAIService();
const result = await ai.generateText("Analyze feedback data", {
  model: "gpt-4o-mini",
});
```
