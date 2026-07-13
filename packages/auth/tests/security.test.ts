import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCookieOptions,
  constantTimeEqual,
  detectSuspiciousLogin,
  evaluatePasswordStrength,
  generateCsrfToken,
  generateToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "../src/security/index.js";

test("security helpers hash and verify passwords", async () => {
  const hash = await hashPassword("CorrectHorseBatteryStaple!");
  assert.equal(await verifyPassword("CorrectHorseBatteryStaple!", hash), true);
  assert.equal(await verifyPassword("incorrect", hash), false);
});

test("security helpers generate opaque tokens", () => {
  const tokenA = generateToken();
  const tokenB = generateToken();
  assert.notEqual(tokenA, tokenB);
  assert.equal(generateCsrfToken().length > 0, true);
  assert.equal(hashToken("token", "secret").length > 0, true);
  assert.equal(constantTimeEqual("abc", "abc"), true);
  assert.equal(constantTimeEqual("abc", "def"), false);
});

test("password strength assessment reports issues", () => {
  const strong = evaluatePasswordStrength("CorrectHorseBatteryStaple1!");
  const weak = evaluatePasswordStrength("password");

  assert.equal(strong.isStrong, true);
  assert.equal(weak.isStrong, false);
  assert.ok(weak.issues.length > 0);
});

test("cookie options default to hardened values", () => {
  const options = buildCookieOptions({
    name: "auth.session",
    value: "token",
  });

  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.path, "/");
});

test("suspicious login detection compares request signals", () => {
  const result = detectSuspiciousLogin(
    {
      ipAddress: "127.0.0.1",
      userAgent: "TestAgent/1.0",
      deviceFingerprint: "fp-1",
    },
    {
      ipAddress: "192.0.2.10",
      userAgent: "TestAgent/2.0",
      deviceFingerprint: "fp-2",
    },
  );

  assert.equal(result.isSuspicious, true);
  assert.equal(result.reasons.length >= 1, true);
});

