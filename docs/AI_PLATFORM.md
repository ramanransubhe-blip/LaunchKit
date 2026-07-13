# AI Platform Overview

DevLaunchKit includes a provider-agnostic AI Platform. The core application logic references a centralized `AIService` interface rather than interacting directly with specific APIs (like OpenAI, Google Gemini, or Anthropic Claude).

```mermaid
graph TD
    App[SaaS Application] --> AIService[AIService Interface]
    AIService --> OpenAIAdapter[OpenAIService]
    AIService --> GeminiAdapter[GeminiService]
    AIService --> AnthropicAdapter[AnthropicService]
```

## Key Capabilities

1.  **Multiple Providers Support**: Switch between OpenAI, Google Gemini, and Anthropic Claude with configuration variables.
2.  **Modular Checkouts**: Generates text responses, stream chunks, structured JSON objects, and embeddings.
3.  **Local Mock fallbacks**: Complete offline emulation modes for development environments.
4.  **Cost & Usage Trackers**: Observability layer to trace latency, input/output tokens, and costs.
