import type {
  AuthClientTransport,
  AuthClientOperation,
  AuthClientRequestMap,
  AuthClientResponseMap,
} from "./index.js";
import { isAuthError, toAuthError } from "../core/errors.js";

/**
 * Creates a browser-side fetch auth transport.
 *
 * @param apiBaseUrl - Base URL of the auth API endpoint (default: "/api/auth").
 * @returns AuthClientTransport instance.
 *
 * @example
 * ```ts
 * const transport = createFetchAuthTransport("/api/auth");
 * const client = createAuthClient(transport);
 * ```
 */
export function createFetchAuthTransport(apiBaseUrl = "/api/auth"): AuthClientTransport {
  return {
    async request<K extends AuthClientOperation>(
      operation: K,
      input: AuthClientRequestMap[K]
    ): Promise<AuthClientResponseMap[K]> {
      try {
        const cleanBaseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

        const isReadOperation = operation.startsWith("get") || operation.startsWith("list");

        const method = isReadOperation ? "GET" : "POST";
        let url = `${cleanBaseUrl}/${operation}`;

        const options: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
          },
        };

        if (method === "GET") {
          // Serialize input as query parameters if present and is an object
          if (input && typeof input === "object") {
            const queryParams = new URLSearchParams();
            Object.entries(input).forEach(([key, val]) => {
              if (val !== undefined && val !== null) {
                queryParams.append(key, String(val));
              }
            });
            const queryString = queryParams.toString();
            if (queryString) {
              url = `${url}?${queryString}`;
            }
          } else if (input !== undefined && input !== null) {
            // If it's a simple single primitive token/id
            url = `${url}?token=${encodeURIComponent(String(input))}`;
          }
        } else {
          options.body = JSON.stringify(input);
        }

        const response = await fetch(url, options);
        const text = await response.text();

        let json: any;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error(`Failed to parse auth API response: ${text}`);
        }

        if (!response.ok || !json.success) {
          const errorPayload = json.error || {
            code: "PROVIDER_ERROR",
            message: `API request failed with status ${response.status}`,
          };
          const constructedError = toAuthError(new Error(errorPayload.message), errorPayload.code);
          throw constructedError;
        }

        return json.data as AuthClientResponseMap[K];
      } catch (error) {
        if (isAuthError(error)) {
          throw error;
        }
        throw toAuthError(error);
      }
    },
  };
}
