import { test } from "node:test";
import * as assert from "node:assert";
import {
  createOpenAIService,
  createGeminiService,
  createAnthropicService,
  setGlobalAIService,
  getGlobalAIService,
} from "../src/index.js";
import { AIProviderError, isAIError } from "../src/core/errors.js";
import { generateTextAction, chatAction } from "../src/server/actions.js";

test("OpenAI adapter mock flow", async () => {
  const service = createOpenAIService({ isMock: true });
  assert.equal(service.providerName, "openai");

  const result = await service.generateText("Write a hello world");
  assert.ok(result.text.includes("OpenAI Mock Response"));
  assert.equal(result.model, "gpt-4o");
  assert.equal(result.usage.totalTokens, 20);

  const embedResult = await service.embed("hello");
  assert.equal(embedResult.embedding.length, 1536);
});

test("Gemini adapter mock flow", async () => {
  const service = createGeminiService({ isMock: true });
  assert.equal(service.providerName, "gemini");

  const result = await service.generateText("Write a hello world");
  assert.ok(result.text.includes("Gemini Mock Response"));
  assert.equal(result.model, "gemini-1.5-flash");

  const embedResult = await service.embed("hello");
  assert.equal(embedResult.embedding.length, 768);
});

test("Anthropic adapter mock flow", async () => {
  const service = createAnthropicService({ isMock: true });
  assert.equal(service.providerName, "anthropic");

  const result = await service.generateText("Write a hello world");
  assert.ok(result.text.includes("Anthropic Mock Response"));
  assert.equal(result.model, "claude-3-5-sonnet-20241022");
});

test("Global registrar exceptions", async () => {
  assert.throws(() => getGlobalAIService(), /No global AIService registered/);
});

test("AI server actions validation and simulation", async () => {
  const service = createOpenAIService({ isMock: true });
  setGlobalAIService(service);

  // Success path
  const response = await generateTextAction({
    prompt: "Show me a coding task",
    options: { temperature: 0.8 },
  });
  assert.equal(response.success, true);
  assert.ok(response.data?.text.includes("Completed prompt"));

  // Failure path due to empty prompt validation
  const failResponse = await generateTextAction({
    prompt: "",
  });
  assert.equal(failResponse.success, false);
  assert.equal(failResponse.error?.code, "AI_INTERNAL_ERROR");
});
