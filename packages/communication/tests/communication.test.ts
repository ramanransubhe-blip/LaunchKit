import { test } from "node:test";
import * as assert from "node:assert";
import {
  createResendCommunicationService,
  createPostmarkCommunicationService,
  setGlobalCommunicationService,
  getGlobalCommunicationService,
} from "../src/index.js";
import {
  CommunicationTemplateMissingError,
  isCommunicationError,
} from "../src/core/errors.js";
import {
  sendEmailAction,
  scheduleEmailAction,
} from "../src/server/actions.js";

test("Resend adapter mock flow", async () => {
  const service = createResendCommunicationService({ isMock: true });
  assert.equal(service.providerName, "resend");

  const send = await service.sendEmail("test@user.com", "Welcome", "welcome_email", { name: "User" });
  assert.ok(send.messageId.startsWith("re_mock_"));
  assert.equal(send.status, "sent");

  const track = await service.track(send.messageId);
  assert.equal(track.status, "delivered");

  const sched = await service.schedule(new Date(), "weekly_digest", "test@user.com");
  assert.ok(sched.startsWith("sched_mock_"));

  await assert.rejects(
    () => service.sendEmail("test@user.com", "Alert", "missing_template"),
    (err) => {
      assert.ok(isCommunicationError(err));
      assert.equal(err.code, "COMMUNICATION_TEMPLATE_MISSING");
      return true;
    }
  );
});

test("Postmark adapter mock flow", async () => {
  const service = createPostmarkCommunicationService({ isMock: true });
  assert.equal(service.providerName, "postmark");

  const send = await service.sendEmail("test@user.com", "Welcome", "welcome_email");
  assert.ok(send.messageId.startsWith("pm_mock_"));
});

test("Global registrar check", async () => {
  assert.throws(
    () => getGlobalCommunicationService(),
    /No global CommunicationService registered/
  );
});

test("Communication server actions simulation", async () => {
  const service = createResendCommunicationService({ isMock: true });
  setGlobalCommunicationService(service);

  // Success path
  const response = await sendEmailAction({
    to: "test@user.com",
    subject: "Greetings",
    templateName: "welcome_email",
    variables: { username: "LaunchKitUser" },
  });
  assert.equal(response.success, true);
  assert.ok(response.data?.messageId.startsWith("re_mock_"));

  // Failure validation path due to missing/invalid parameters
  const failResponse = await sendEmailAction({
    to: "invalid-email",
    subject: "",
    templateName: "",
  });
  assert.equal(failResponse.success, false);
  assert.equal(failResponse.error?.code, "COMMUNICATION_INTERNAL_ERROR");
});
