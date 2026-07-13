import type { BillingService } from "./contracts.js";

let activeBillingService: BillingService | null = null;

export function getGlobalBillingService(): BillingService {
  if (!activeBillingService) {
    throw new Error(
      "No global BillingService registered. Register a service using setGlobalBillingService(service) during bootstrap."
    );
  }
  return activeBillingService;
}

export function setGlobalBillingService(service: BillingService): void {
  activeBillingService = service;
}
