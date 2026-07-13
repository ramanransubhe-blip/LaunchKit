import type { StorageService } from "./contracts.js";

let activeStorageService: StorageService | null = null;

export function getGlobalStorageService(): StorageService {
  if (!activeStorageService) {
    throw new Error(
      "No global StorageService registered. Register a storage service using setGlobalStorageService(service) during bootstrap."
    );
  }
  return activeStorageService;
}

export function setGlobalStorageService(service: StorageService): void {
  activeStorageService = service;
}
