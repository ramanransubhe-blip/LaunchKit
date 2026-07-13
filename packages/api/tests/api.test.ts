import { test } from "node:test";
import * as assert from "node:assert";
import {
  sendSuccess,
  sendFailure,
  sendPagination,
  sendCursor,
  LaunchKitClient,
  createApiKeyAction,
  queryRequestLogsAction,
} from "../src/index.js";

test("Standard API response builders", () => {
  const success = sendSuccess({ user: "Alice" }, { timing: 42 });
  assert.equal(success.success, true);
  assert.equal((success.data as any).user, "Alice");
  assert.equal(success.meta?.timing, 42);

  const failure = sendFailure("Something failed", "BAD_REQUEST", { field: "email" });
  assert.equal(failure.success, false);
  assert.equal(failure.error?.code, "BAD_REQUEST");
  assert.equal(failure.error?.message, "Something failed");
  assert.equal(failure.error?.details?.field, "email");

  const paginated = sendPagination(["Alice", "Bob"], 1, 10, 2);
  assert.equal(paginated.success, true);
  assert.equal(paginated.meta.page, 1);
  assert.equal(paginated.meta.totalItems, 2);
  assert.equal(paginated.meta.totalPages, 1);
});

test("LaunchKit SDK Client mock requests", async () => {
  // Use mock fetch interceptor if needed, or check initialization properties
  const client = new LaunchKitClient({ baseUrl: "https://mock.api.com", apiKey: "lk_test_key" });
  assert.ok(client.auth);
  assert.ok(client.billing);
  assert.ok(client.ai);
  assert.ok(client.storage);
  assert.ok(client.communication);
});

test("Developer server actions behavior", async () => {
  // Create API Key
  const actionRes = await createApiKeyAction({
    name: "Production Token",
    scopes: ["ai:write", "storage:read"],
  });
  assert.equal(actionRes.success, true);
  assert.ok(actionRes.data?.key.startsWith("lk_live_"));

  // Empty name validation checks
  const failRes = await createApiKeyAction({
    name: "",
    scopes: [],
  });
  assert.equal(failRes.success, false);
});
