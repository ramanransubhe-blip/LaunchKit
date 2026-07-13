import { createHash } from "node:crypto";
import type {
  AnyRole,
  AuthDevice,
  AuthOrganization,
  AuthUser,
  Permission,
} from "../types/index.js";
import type { AuthContext } from "../core/contracts.js";

/**
 * Normalizes an email address.
 *
 * @param email - Email to normalize.
 * @returns Normalized email.
 */
export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Converts a string into a URL-safe slug.
 *
 * @param input - Input string.
 * @returns Slug string.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Masks an email address for logging.
 *
 * @param email - Email to mask.
 * @returns Masked email.
 */
export function maskEmailAddress(email: string): string {
  const normalized = normalizeEmailAddress(email);
  const [name, domain] = normalized.split("@");
  if (!name || !domain) {
    return normalized;
  }
  if (name.length <= 2) {
    return `**@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Creates a deterministic device fingerprint.
 *
 * @param input - Request metadata.
 * @returns Stable fingerprint hash.
 */
export function createDeviceFingerprint(input: {
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
}): string {
  const source = [
    input.ipAddress ?? "",
    input.userAgent ?? "",
    input.deviceId ?? "",
  ].join("|");
  return createHash("sha256").update(source).digest("base64url");
}

/**
 * Formats a role label for display.
 *
 * @param role - Role value.
 * @returns Human-readable role label.
 */
export function formatRoleLabel(role: AnyRole): string {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

/**
 * Formats a permission label for display.
 *
 * @param permission - Permission value.
 * @returns Human-readable permission label.
 */
export function formatPermissionLabel(permission: Permission): string {
  return permission
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

/**
 * Returns the display name for a user.
 *
 * @param user - Auth user.
 * @returns Display name fallback.
 */
export function resolveDisplayName(user: Pick<AuthUser, "name" | "email">): string {
  return user.name ?? user.email.split("@")[0] ?? "User";
}

/**
 * Resolves the active organization label.
 *
 * @param organization - Organization or `null`.
 * @returns Display label.
 */
export function resolveOrganizationLabel(
  organization: AuthOrganization | null,
): string {
  return organization?.name ?? "Personal";
}

/**
 * Creates a derived auth context with explicit roles and permissions.
 *
 * @param input - Context ingredients.
 * @returns Auth context snapshot.
 */
export function createAuthContext(input: {
  user: AuthUser | null;
  session: AuthContext["session"];
  organization: AuthOrganization | null;
  roles: readonly AnyRole[];
  permissions: readonly Permission[];
  metadata?: AuthContext["metadata"];
}): AuthContext {
  return {
    isAuthenticated: Boolean(input.user && input.session),
    user: input.user,
    session: input.session,
    organization: input.organization,
    roles: input.roles,
    permissions: input.permissions,
    metadata: input.metadata ?? null,
  };
}

/**
 * Extracts the public subset of a user object.
 *
 * @param user - Auth user.
 * @returns Public user projection.
 */
export function pickPublicUser(user: AuthUser): Pick<
  AuthUser,
  "id" | "name" | "email" | "image" | "role" | "organizationId"
> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    organizationId: user.organizationId,
  };
}

/**
 * Extracts the public subset of a device object.
 *
 * @param device - Auth device.
 * @returns Public device projection.
 */
export function pickPublicDevice(device: AuthDevice): AuthDevice {
  return {
    ...device,
  };
}
