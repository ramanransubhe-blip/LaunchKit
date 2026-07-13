import type { CommunicationService } from "./contracts.js";

let activeCommunicationService: CommunicationService | null = null;

export function getGlobalCommunicationService(): CommunicationService {
  if (!activeCommunicationService) {
    throw new Error(
      "No global CommunicationService registered. Register a communication service using setGlobalCommunicationService(service) during bootstrap."
    );
  }
  return activeCommunicationService;
}

export function setGlobalCommunicationService(service: CommunicationService): void {
  activeCommunicationService = service;
}
