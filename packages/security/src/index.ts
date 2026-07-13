import crypto from "node:crypto";

// 1. Random Generators & Tokens
export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

// 2. Encryption Utilities (AES-256-GCM)
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function encrypt(text: string, secretKeyHex: string): { iv: string; encryptedData: string; authTag: string } {
  const secretKey = Buffer.from(secretKeyHex, "hex");
  if (secretKey.length !== 32) {
    throw new Error("Secret key hex must represent exactly 32 bytes (256 bits)");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
    authTag,
  };
}

export function decrypt(encryptedTextHex: string, secretKeyHex: string, ivHex: string, authTagHex: string): string {
  const secretKey = Buffer.from(secretKeyHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedTextHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// 3. Cryptographic Hashing (SHA-256)
export function hashString(value: string, salt = ""): string {
  return crypto.createHmac("sha256", salt).update(value).digest("hex");
}

// 4. Secure Cookies Helpers
export function getSecureCookieOptions(env: "development" | "production" | "test", maxAgeSeconds = 3600 * 24 * 7) {
  return {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax" as const,
    maxAge: maxAgeSeconds,
    path: "/",
  };
}

// 5. CSRF Utility Helpers
export function generateCsrfToken(): string {
  return generateRandomToken(24);
}

export function verifyCsrfToken(cookieToken: string, headerToken: string): boolean {
  if (!cookieToken || !headerToken) return false;
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken, "utf8"),
    Buffer.from(headerToken, "utf8")
  );
}

// 6. Content Security Policy (CSP) Headers Builder
export function generateCspHeader(nonce: string): string {
  const directives = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https://avatar.vercel.sh", "https://logo.vercel.sh"],
    "connect-src": ["'self'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'self'"],
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}
