import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { hashToken as hashSecretToken } from "../security/index.js";

/** Token categories used by the auth platform. */
export const AuthTokenType = {
  Session: "session",
  Verification: "verification",
  PasswordReset: "password-reset",
  MagicLink: "magic-link",
  Invitation: "invitation",
  OAuthState: "oauth-state",
  CSRF: "csrf",
  DeviceTrust: "device-trust",
} as const;

/** Token categories used by the auth platform. */
export type AuthTokenType =
  (typeof AuthTokenType)[keyof typeof AuthTokenType];

/** Claims embedded into a signed auth token. */
export interface AuthTokenClaims {
  /** Token subject. */
  sub: string;
  /** Token type. */
  typ: AuthTokenType;
  /** Issued-at timestamp. */
  iat: number;
  /** Expiry timestamp. */
  exp: number;
  /** Unique nonce. */
  jti: string;
  /** Optional additional claims. */
  data: Readonly<Record<string, string | number | boolean | null>>;
}

/** Token envelope that stores both the raw token and its hash. */
export interface AuthTokenEnvelope {
  /** Raw secret token to send to the client or email recipient. */
  token: string;
  /** Hash suitable for database storage. */
  hash: string;
  /** Expiration time. */
  expiresAt: Date;
}

/** Signed token result. */
export interface SignedAuthToken {
  /** Serialized signed token. */
  token: string;
  /** Parsed claims. */
  claims: AuthTokenClaims;
}

const TOKEN_ALGORITHM = "sha256";

/**
 * Generates a secure opaque token.
 *
 * @param bytes - Number of random bytes.
 * @returns URL-safe token.
 */
export function createOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * Hashes a token for safe persistence.
 *
 * @param token - Raw token.
 * @param secret - Server secret.
 * @returns Token digest.
 */
export function hashAuthToken(token: string, secret: string): string {
  return hashSecretToken(token, secret);
}

/**
 * Creates a one-time token envelope.
 *
 * @param secret - Server secret.
 * @param expiresInSeconds - Lifetime in seconds.
 * @returns Token envelope with hash and expiry.
 */
export function createTokenEnvelope(
  secret: string,
  expiresInSeconds: number,
): AuthTokenEnvelope {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  return {
    token,
    hash: hashAuthToken(token, secret),
    expiresAt,
  };
}

/**
 * Creates a signed token string with embedded claims.
 *
 * @param subject - Token subject.
 * @param type - Token category.
 * @param secret - Signing secret.
 * @param expiresInSeconds - Lifetime in seconds.
 * @param data - Additional claims.
 * @returns Signed token and parsed claims.
 */
export function createSignedToken(
  subject: string,
  type: AuthTokenType,
  secret: string,
  expiresInSeconds: number,
  data: Readonly<Record<string, string | number | boolean | null>> = {},
): SignedAuthToken {
  const now = Math.floor(Date.now() / 1000);
  const claims: AuthTokenClaims = {
    sub: subject,
    typ: type,
    iat: now,
    exp: now + expiresInSeconds,
    jti: createOpaqueToken(16),
    data,
  };

  const encoded = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac(TOKEN_ALGORITHM, secret)
    .update(encoded)
    .digest("base64url");

  return {
    token: `${encoded}.${signature}`,
    claims,
  };
}

/**
 * Verifies a signed token string.
 *
 * @param token - Signed token string.
 * @param secret - Verification secret.
 * @returns Parsed claims when valid.
 */
export function verifySignedToken(
  token: string,
  secret: string,
): AuthTokenClaims | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = createHmac(TOKEN_ALGORITHM, secret)
    .update(encoded)
    .digest("base64url");
  if (!constantTimeCompare(signature, expected)) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as AuthTokenClaims;
    if (claims.exp * 1000 < Date.now()) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

/**
 * Creates a password-reset token envelope.
 *
 * @param secret - Server secret.
 * @returns One-time token envelope.
 */
export function createPasswordResetToken(secret: string): AuthTokenEnvelope {
  return createTokenEnvelope(secret, 60 * 60);
}

/**
 * Creates a verification token envelope.
 *
 * @param secret - Server secret.
 * @returns One-time token envelope.
 */
export function createVerificationToken(secret: string): AuthTokenEnvelope {
  return createTokenEnvelope(secret, 60 * 60 * 24);
}

/**
 * Creates a magic-link token envelope.
 *
 * @param secret - Server secret.
 * @returns One-time token envelope.
 */
export function createMagicLinkToken(secret: string): AuthTokenEnvelope {
  return createTokenEnvelope(secret, 60 * 15);
}

/**
 * Creates an invitation token envelope.
 *
 * @param secret - Server secret.
 * @returns One-time token envelope.
 */
export function createInvitationToken(secret: string): AuthTokenEnvelope {
  return createTokenEnvelope(secret, 60 * 60 * 24 * 7);
}

function constantTimeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}
