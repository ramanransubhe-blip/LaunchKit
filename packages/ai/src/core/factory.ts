import type { AIService } from "./contracts.js";

let activeAIService: AIService | null = null;

export function getGlobalAIService(): AIService {
  if (!activeAIService) {
    throw new Error(
      "No global AIService registered. Register an AI service using setGlobalAIService(service) during bootstrap."
    );
  }
  return activeAIService;
}

export function setGlobalAIService(service: AIService): void {
  activeAIService = service;
}
