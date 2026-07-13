# Tool Calling Definitions

DevLaunchKit includes schemas for custom tool registrations and functional callings.

---

## Defining a Custom Tool

Use standard schema templates to register functions matching OpenAI, Gemini, or Anthropic schemas:

```json
{
  "name": "get_weather",
  "description": "Get current weather parameters for a city",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string" }
    },
    "required": ["city"]
  }
}
```

---

## Processing Tool Calls

Your application code intercepts the returned tool call actions and dispatches responses back into the conversation context.
