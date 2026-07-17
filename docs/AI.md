# AI Platform Guide

Configuring and utilizing the provider-agnostic Multi-LLM AI Gateway.

---

## Purpose

This document explains the architecture of `@devlaunchkit/ai`, providing developers with setup details, example code snippet patterns, and troubleshooting steps for OpenAI, Anthropic, and Google Gemini integrations.

## Prerequisites

- AI API provider keys (OpenAI Key, Anthropic Key, or Google Gemini Key)
- Decoupled API environment configs set up in `.env`

---

## Multi-LLM AI Gateway Architecture

DevLaunchKit features a provider-agnostic AI Gateway. You configure the models, fallback rules, and credentials in your environment, and the application interacts with a single unified interface.

```typescript
export interface AiService {
  generateText(prompt: string, options?: AiOptions): Promise<string>;
  streamText(prompt: string, callback: (chunk: string) => void, options?: AiOptions): Promise<void>;
  generateStructuredData<T>(prompt: string, schema: z.ZodType<T>, options?: AiOptions): Promise<T>;
}
```

---

## Configuration Setup

Enable one or multiple AI engines by adding their respective API keys to `.env`:

```env
# Google Gemini (Default local fallback)
GEMINI_API_KEY=AIzaSy...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Usage Examples

### 1. Generating Text Completions

```typescript
import { ai } from "@devlaunchkit/ai";

const response = await ai.generateText("Write a 50-word introduction to a SaaS product.");
console.log(response);
```

### 2. Streaming Real-time Completions

```typescript
import { ai } from "@devlaunchkit/ai";

await ai.streamText("List 5 feature flags use-cases:", (chunk) => {
  process.stdout.write(chunk);
});
```

### 3. Generating Structured JSON Output with Zod

```typescript
import { ai } from "@devlaunchkit/ai";
import { z } from "zod";

const FeatureListSchema = z.object({
  features: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      complexity: z.enum(["low", "medium", "high"]),
    })
  ),
});

const schemaResponse = await ai.generateStructuredData(
  "Generate 3 SaaS features for a developer portal.",
  FeatureListSchema
);

console.log(schemaResponse.features);
```

---

## Screenshots Placeholder

![AI Stream UI Generation Component](/assets/ai_platform.png)
_AI assistant chat module displaying real-time streaming output in the user dashboard._

---

## Best Practices

- **Implement fallback rules**: Set up Anthropic or OpenAI as primary model providers, and keep Google Gemini as a cost-effective secondary fallback.
- **Use Zod schemas for system integrations**: When utilizing LLM outputs inside database seeds or routing logic, always use `generateStructuredData` to ensure the structure is verified.

## Common Mistakes

- **Leaking Keys to client side**: Importing `@devlaunchkit/ai` directly inside Next.js client component files instead of calling them within API Routes or Server Actions, causing keys to be exposed in browser bundles.
- **Exceeding Rate Limits**: Failing to implement token/request limits on public user prompts, leading to high bills or API account suspensions.

---

## Troubleshooting

- **API Key Invalid Error**:
  - Run `pnpm doctor` to confirm the AI keys are successfully loaded and parsed.
  - Verify that the target model is supported by your key tier (e.g. OpenAI GPT-4o requires active credit).
- **Zod Validation Failure**:
  - If the structured JSON generation fails validation, increase the model's temperature, or refine the prompt description to give the LLM clear schema guidance.
