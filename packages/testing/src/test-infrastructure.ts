import { config } from "@devlaunchkit/config";
import { ValidationError, serializeError } from "@devlaunchkit/errors";
import { logger, logContextStorage } from "@devlaunchkit/logger";
import { cache } from "@devlaunchkit/cache";
import { queue } from "@devlaunchkit/queue";
import { eventBus } from "@devlaunchkit/events";
import { encrypt, decrypt, generateCsrfToken } from "@devlaunchkit/security";
import { validateBody, emailSchema } from "@devlaunchkit/validation";
import { RateLimiter } from "@devlaunchkit/rate-limit";
import { getSystemMetrics } from "@devlaunchkit/telemetry";
import { observability } from "@devlaunchkit/observability";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log("🏃 Starting DevLaunchKit Core Infrastructure Verification Tests...\n");

  // State container to bypass TS flow-analysis narrowing on async closures
  const state = {
    eventReceived: false,
    jobProcessed: false,
  };

  // 1. Env & Configuration Testing
  console.log("⚙️  1. Testing Configuration Service...");
  assert(config.app.name === "DevLaunchKit", "App name matches config");
  assert(typeof config.app.port === "number", "Port is correctly transformed to a number");

  // 2. Custom Application Errors Serialization
  console.log("\n💥 2. Testing Custom Error Hierarchies...");
  const validationErr = new ValidationError("Email required", { email: ["must not be blank"] });
  const serialized = serializeError(validationErr);
  assert(serialized.success === false, "Error serialization includes success: false");
  assert(serialized.error.code === "VALIDATION_ERROR", "Error code matches subclass specification");

  // 3. Structured Logger & Context Correlation ID Tracking
  console.log("\n🪵 3. Testing Context-Scoped Logger...");
  logContextStorage.run({ requestId: "test-correlation-id" }, () => {
    logger.info("Executing verification test under logContextStorage boundary");
  });
  assert(true, "Logger context runs without exceptions");

  // 4. Cache & Tag Invalidation Engine
  console.log("\n💾 4. Testing Caching Engine...");
  await cache.set("user:123", { name: "Alice" }, 10, ["users"]);
  await cache.set("user:456", { name: "Bob" }, 10, ["users"]);
  await cache.set("org:999", { name: "Stripe" }, 10, ["orgs"]);

  let alice = await cache.get<{ name: string }>("user:123");
  assert(alice?.name === "Alice", "Cache retrieves set values");

  // Invalidate by Tag
  await cache.invalidateByTags(["users"]);
  alice = await cache.get("user:123");
  const stripe = await cache.get("org:999");
  assert(alice === null, "Invalidated tag values are purged");
  assert(stripe !== null, "Non-invalidated tag values are preserved");

  // 5. Sliding Window Rate Limiting
  console.log("\n⏱️  5. Testing Rate Limiting...");
  const limiter = new RateLimiter(2, 1000); // 2 requests per second
  const hit1 = await limiter.check("client_ip");
  const hit2 = await limiter.check("client_ip");
  const hit3 = await limiter.check("client_ip");

  assert(hit1.allowed === true, "First request within limit window is allowed");
  assert(hit2.allowed === true, "Second request within limit window is allowed");
  assert(hit3.allowed === false, "Third request exceeding limit window is blocked");

  // 6. Asynchronous Events Bus
  console.log("\n🔔 6. Testing Events Bus...");
  const unsubscribe = eventBus.subscribe("user:signup", (payload) => {
    assert(payload.email === "test@example.com", "Subscriber receives correct event payload");
    state.eventReceived = true;
  });

  eventBus.publish("user:signup", {
    profileId: "usr_1",
    email: "test@example.com",
    timestamp: new Date(),
  });
  await new Promise((r) => setTimeout(r, 50)); // await async setImmediate queue dispatch
  assert(state.eventReceived === true, "Async subscriber executes callback successfully");
  unsubscribe();

  // 7. Security Cryptography (AES Encryption & CSRF)
  console.log("\n🔐 7. Testing Cryptography & Security...");
  const secretKey = "a1b2c3d4e5f60718293a4b5c6d7e8f900112233445566778899aabbccddeeff0";
  const originalText = "Super secret data payload";
  const { iv, encryptedData, authTag } = encrypt(originalText, secretKey);
  const decryptedText = decrypt(encryptedData, secretKey, iv, authTag);
  assert(decryptedText === originalText, "Symmetric encryption AES-256-GCM decrypts correctly");

  const csrf = generateCsrfToken();
  assert(csrf.length === 48, "CSRF token generated with sufficient entropy");

  // 8. Payload Validation Zod Pipelines
  console.log("\n📝 8. Testing Request Validation Layer...");
  try {
    validateBody(emailSchema, "not-an-email");
    assert(false, "Invalid format validation should have thrown");
  } catch (err) {
    assert(err instanceof ValidationError, "Validation fails with a ValidationError instance");
  }

  // 9. Telemetry & Observability Diagnoses
  console.log("\n📊 9. Testing System Telemetry & Observability Health checks...");
  const metrics = getSystemMetrics();
  assert(metrics.memory.usagePercent > 0, "System metrics retrieve memory load percentages");

  observability.registerCheck("db", async () => ({ status: "healthy" }));
  const health = await observability.runHealthChecks();
  assert(health.status === "healthy", "Health checks aggregate system diagnostic results");

  // 10. Background Job Queue processing
  console.log("\n⚙️  10. Testing Background Job Queue...");
  queue.registerHandler("send-email", (payload: { to: string }) => {
    assert(payload.to === "verify@example.com", "Job worker retrieves correct payload");
    state.jobProcessed = true;
  });

  await queue.push({ name: "send-email", payload: { to: "verify@example.com" } });
  await new Promise((r) => setTimeout(r, 100)); // await queue runner loop
  assert(state.jobProcessed === true, "Job queue executes worker handler successfully");

  console.log("\n🎉 All Core Infrastructure Tests Passed Successfully!");
}

runTests().catch((err) => {
  console.error("\n❌ Verification Test Run Failed:", err);
  process.exit(1);
});
