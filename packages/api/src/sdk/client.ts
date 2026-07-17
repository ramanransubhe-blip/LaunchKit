import type { ApiResponse } from "../index.js";

export interface ClientConfig {
  baseUrl?: string;
  apiKey?: string;
}

export class LaunchKitClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config: ClientConfig = {}) {
    this.baseUrl = config.baseUrl || "http://localhost:3000/api";
    this.apiKey = config.apiKey;
  }

  private async request<T>(path: string, method = "GET", body?: unknown): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          success: false,
          error: {
            code: "API_REQUEST_FAILED",
            message: `Request failed with code ${response.status}: ${text}`,
          },
        };
      }

      return (await response.json()) as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  // Auth Operations
  readonly auth = {
    login: async (credentials: unknown) => this.request<any>("/auth/login", "POST", credentials),
    logout: async () => this.request<any>("/auth/logout", "POST"),
  };

  // Billing Operations
  readonly billing = {
    createCheckout: async (payload: unknown) =>
      this.request<any>("/billing/checkout", "POST", payload),
    listInvoices: async (customerId: string) =>
      this.request<any>(`/billing/invoices?customer=${customerId}`),
  };

  // AI Operations
  readonly ai = {
    generateText: async (payload: unknown) => this.request<any>("/ai/generate", "POST", payload),
    embed: async (payload: unknown) => this.request<any>("/ai/embed", "POST", payload),
  };

  // Storage Operations
  readonly storage = {
    upload: async (bucket: string, path: string, contentBase64: string) =>
      this.request<any>(`/storage/upload`, "POST", { bucket, path, content: contentBase64 }),
    delete: async (bucket: string, path: string) =>
      this.request<any>(`/storage/delete`, "POST", { bucket, path }),
  };

  // Communication Operations
  readonly communication = {
    sendEmail: async (payload: unknown) =>
      this.request<any>("/communication/email", "POST", payload),
    sendNotification: async (payload: unknown) =>
      this.request<any>("/communication/notification", "POST", payload),
  };
}
