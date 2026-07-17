import { createHmac, randomBytes, timingSafeEqual, scryptSync } from "node:crypto";

/** Password hashing configuration. */
export interface PasswordPolicy {
  /** Minimum accepted length. */
  minLength: number;
  /** Require at least one uppercase character. */
  requireUppercase: boolean;
  /** Require at least one lowercase character. */
  requireLowercase: boolean;
  /** Require at least one numeric character. */
  requireNumber: boolean;
  /** Require at least one symbol character. */
  requireSymbol: boolean;
  /** Reject obviously common passwords. */
  rejectCommonPasswords: boolean;
}

/** Assessment returned by `evaluatePasswordStrength`. */
export interface PasswordStrengthAssessment {
  /** Score from 0 to 4. */
  readonly score: number;
  /** Whether the password is strong enough for the policy. */
  readonly isStrong: boolean;
  /** Reasons the password failed the current policy. */
  readonly issues: readonly string[];
}

/** Cookie hardening options. */
export interface CookieOptions {
  /** Cookie name. */
  readonly name: string;
  /** Cookie value. */
  value: string;
  /** HTTP only flag. */
  httpOnly: boolean;
  /** Secure flag. */
  secure: boolean;
  /** SameSite policy. */
  sameSite: "strict" | "lax" | "none";
  /** Cookie path. */
  path: string;
  /** Optional cookie domain. */
  domain: string | null;
  /** Optional max age in seconds. */
  maxAge: number | null;
}

/** Request signal used to detect suspicious logins. */
export interface LoginSignal {
  /** IP address from the current request. */
  ipAddress: string | null;
  /** User agent from the current request. */
  userAgent: string | null;
  /** Device fingerprint from the current request. */
  deviceFingerprint: string | null;
}

/** Result returned by suspicious login detection. */
export interface SuspiciousLoginAssessment {
  /** Whether the login looks suspicious. */
  readonly isSuspicious: boolean;
  /** Human-readable reasons for the decision. */
  readonly reasons: readonly string[];
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
  rejectCommonPasswords: true,
};

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "123456",
  "123456789",
  "qwerty",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "abc123",
]);

/**
 * Generates a cryptographically secure opaque token.
 *
 * @param bytes - Number of random bytes to use.
 * @returns URL-safe token string.
 *
 * @example
 * ```ts
 * const token = generateToken();
 * ```
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * Generates a CSRF token.
 *
 * @returns URL-safe CSRF token.
 */
export function generateCsrfToken(): string {
  return generateToken(24);
}

/**
 * Hashes a token with SHA-256 and a server secret.
 *
 * @param token - Token to hash.
 * @param secret - Server secret used for HMAC.
 * @returns Stable token digest.
 */
export function hashToken(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("base64url");
}

/**
 * Compares two secrets using a constant-time comparison.
 *
 * @param left - First secret.
 * @param right - Second secret.
 * @returns `true` when the values match.
 */
export function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * Hashes a password using `scrypt`.
 *
 * @param password - Plaintext password.
 * @param policy - Optional policy override.
 * @returns Encoded password hash.
 *
 * @example
 * ```ts
 * const hash = await hashPassword("CorrectHorseBatteryStaple!");
 * ```
 */
export async function hashPassword(
  password: string,
  policy: Partial<PasswordPolicy> = {}
): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const cost = 16_384;
  const blockSize = 8;
  const parallelization = 1;
  const keyLength = 64;
  const mergedPolicy = { ...DEFAULT_POLICY, ...policy };

  const derived = scryptSync(password, salt, keyLength, {
    N: cost,
    r: blockSize,
    p: parallelization,
  });

  const encoded = derived.toString("base64url");
  return [
    "scrypt",
    String(cost),
    String(blockSize),
    String(parallelization),
    String(keyLength),
    salt,
    encoded,
    String(mergedPolicy.minLength),
  ].join("$");
}

/**
 * Verifies a password against an encoded `scrypt` hash.
 *
 * @param password - Plaintext password.
 * @param encodedHash - Stored encoded hash.
 * @returns `true` when the password matches.
 */
export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const parts = encodedHash.split("$");
  if (parts.length < 8 || parts[0] !== "scrypt") {
    return false;
  }

  const cost = Number(parts[1]);
  const blockSize = Number(parts[2]);
  const parallelization = Number(parts[3]);
  const keyLength = Number(parts[4]);
  const salt = parts[5];
  const expectedHash = parts[6];

  if (
    !Number.isFinite(cost) ||
    !Number.isFinite(blockSize) ||
    !Number.isFinite(parallelization) ||
    !Number.isFinite(keyLength)
  ) {
    return false;
  }

  const derived = scryptSync(password, salt, keyLength, {
    N: cost,
    r: blockSize,
    p: parallelization,
  });
  const actualHash = derived.toString("base64url");
  return constantTimeEqual(actualHash, expectedHash);
}

/**
 * Evaluates a password against the default auth policy.
 *
 * @param password - Password to inspect.
 * @param policy - Optional policy override.
 * @returns Strength assessment and issues.
 *
 * @example
 * ```ts
 * const result = evaluatePasswordStrength("secret");
 * if (!result.isStrong) console.log(result.issues);
 * ```
 */
export function evaluatePasswordStrength(
  password: string,
  policy: Partial<PasswordPolicy> = {}
): PasswordStrengthAssessment {
  const mergedPolicy = { ...DEFAULT_POLICY, ...policy };
  const issues: string[] = [];

  if (password.length < mergedPolicy.minLength) {
    issues.push(`Password must be at least ${mergedPolicy.minLength} characters long.`);
  }
  if (mergedPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    issues.push("Password must contain at least one uppercase letter.");
  }
  if (mergedPolicy.requireLowercase && !/[a-z]/.test(password)) {
    issues.push("Password must contain at least one lowercase letter.");
  }
  if (mergedPolicy.requireNumber && !/[0-9]/.test(password)) {
    issues.push("Password must contain at least one number.");
  }
  if (mergedPolicy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
    issues.push("Password must contain at least one symbol.");
  }
  if (mergedPolicy.rejectCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
    issues.push("Password is too common.");
  }

  const score =
    4 -
    Math.min(4, issues.length) +
    (password.length >= 20 ? 1 : 0) +
    (/[^\w\s]/.test(password) ? 1 : 0);

  return {
    score: Math.max(0, Math.min(4, score)),
    isStrong: issues.length === 0,
    issues,
  };
}

/**
 * Builds hardened cookie options for auth sessions.
 *
 * @param options - Cookie settings.
 * @returns Hardened cookie options.
 */
export function buildCookieOptions(options: {
  name: string;
  value: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  domain?: string | null;
  maxAge?: number | null;
  httpOnly?: boolean;
}): CookieOptions {
  return {
    name: options.name,
    value: options.value,
    httpOnly: options.httpOnly ?? true,
    secure: options.secure ?? true,
    sameSite: options.sameSite ?? "lax",
    path: options.path ?? "/",
    domain: options.domain ?? null,
    maxAge: options.maxAge ?? null,
  };
}

/**
 * Detects suspicious login behavior by comparing current and previous signals.
 *
 * @param previous - Previous trusted login signal.
 * @param current - Current login signal.
 * @returns Suspicious login assessment.
 */
export function detectSuspiciousLogin(
  previous: LoginSignal | null,
  current: LoginSignal
): SuspiciousLoginAssessment {
  if (!previous) {
    return {
      isSuspicious: false,
      reasons: [],
    };
  }

  const reasons: string[] = [];
  if (previous.ipAddress && current.ipAddress && previous.ipAddress !== current.ipAddress) {
    reasons.push("IP address changed.");
  }
  if (previous.userAgent && current.userAgent && previous.userAgent !== current.userAgent) {
    reasons.push("User agent changed.");
  }
  if (
    previous.deviceFingerprint &&
    current.deviceFingerprint &&
    previous.deviceFingerprint !== current.deviceFingerprint
  ) {
    reasons.push("Device fingerprint changed.");
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}
