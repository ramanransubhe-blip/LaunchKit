import type { AuthService } from "../core/contracts.js";
import { isAuthError, serializeAuthError } from "../core/errors.js";

/**
 * Creates standard HTTP handlers for API routing.
 *
 * @param authService - Canonical auth service to delegate to.
 * @returns Object with route handler methods.
 *
 * @example
 * ```ts
 * const handler = createAuthRouteHandler(authService);
 * export const POST = handler.handle;
 * export const GET = handler.handle;
 * ```
 */
export function createAuthRouteHandler(authService: AuthService) {
  return {
    async handle(request: Request): Promise<Response> {
      try {
        const url = new URL(request.url);
        // Operation can be passed as path suffix or query param: /api/auth/[operation] or /api/auth?operation=[operation]
        const pathParts = url.pathname.split("/");
        const operationFromPath = pathParts[pathParts.length - 1];
        const operation =
          operationFromPath && operationFromPath !== "auth"
            ? operationFromPath
            : url.searchParams.get("operation");

        if (!operation) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "BAD_REQUEST",
                message: "Missing operation parameter.",
              },
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Only allow valid operations on AuthService
        const serviceMethod = (authService as any)[operation];
        if (typeof serviceMethod !== "function") {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "NOT_FOUND",
                message: `Operation '${operation}' not supported.`,
              },
            }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        let input: unknown = null;
        if (request.method === "POST" || request.method === "PUT") {
          const contentType = request.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            input = await request.json();
          }
        } else {
          // Map query params for GET/DELETE operations
          const params: Record<string, string> = {};
          url.searchParams.forEach((val, key) => {
            if (key !== "operation") {
              params[key] = val;
            }
          });
          // If there is a single primary parameter required by the service signature (like token, userId, orgId)
          // we pass it either as the first parameter or the mapped object
          if (Object.keys(params).length === 1) {
            input = Object.values(params)[0];
          } else {
            input = params;
          }
        }

        // Execute service operation
        let result: unknown;
        if (input !== null && input !== undefined) {
          // If the input was resolved as an object but the signature expects split fields (e.g. updateProfile(userId, data))
          if (operation === "updateProfile" || operation === "updateUser") {
            const { userId, data } = input as any;
            result = await serviceMethod(userId, data);
          } else if (operation === "createOrganization") {
            const { userId, data } = input as any;
            result = await serviceMethod(userId, data);
          } else if (operation === "updateOrganization") {
            const { orgId, data } = input as any;
            result = await serviceMethod(orgId, data);
          } else if (operation === "inviteToOrganization") {
            const { orgId, email, role } = input as any;
            result = await serviceMethod(orgId, email, role);
          } else if (operation === "removeFromOrganization") {
            const { orgId, userId } = input as any;
            result = await serviceMethod(orgId, userId);
          } else if (operation === "switchOrganization") {
            const { userId, orgId } = input as any;
            result = await serviceMethod(userId, orgId);
          } else if (operation === "changePassword") {
            const { userId, currentPassword, newPassword } = input as any;
            result = await serviceMethod(userId, currentPassword, newPassword);
          } else if (operation === "resetPassword") {
            const { token, newPassword } = input as any;
            result = await serviceMethod(token, newPassword);
          } else if (operation === "getOAuthUrl") {
            const { provider, redirectUrl, state } = input as any;
            result = await serviceMethod(provider, redirectUrl, state);
          } else if (operation === "handleOAuthCallback") {
            const { provider, code, state } = input as any;
            result = await serviceMethod(provider, code, state);
          } else if (operation === "linkProvider") {
            const { userId, provider, code, state } = input as any;
            result = await serviceMethod(userId, provider, code, state);
          } else if (operation === "unlinkProvider") {
            const { userId, provider } = input as any;
            result = await serviceMethod(userId, provider);
          } else {
            // For simple single parameter or object parameter operations
            result = await serviceMethod(input);
          }
        } else {
          result = await serviceMethod();
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: result ?? null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        const serialized = serializeAuthError(error);
        const status = isAuthError(error) ? error.statusCode : 500;

        return new Response(JSON.stringify(serialized), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
  };
}
