import { test } from "node:test";
import * as assert from "node:assert";
import {
  createDodoBillingService,
  createStripeBillingService,
  setGlobalBillingService,
  getGlobalBillingService,
} from "../src/index.js";
import {
  BillingProviderError,
  BillingWebhookError,
  isBillingError,
} from "../src/core/errors.js";
import {
  createCheckoutAction,
  upgradePlanAction,
} from "../src/server/actions.js";

test("Dodo Payments service adapter mock flow", async () => {
  const service = createDodoBillingService({ isMock: true });
  assert.equal(service.providerName, "dodo-payments");

  const customer = await service.createCustomer("test@dodo.com", "Dodo Dev");
  assert.ok(customer.id.startsWith("cust_dodo_mock"));
  assert.equal(customer.email, "test@dodo.com");

  const checkout = await service.createCheckout(customer.id, "price_premium", "https://success.com", "https://cancel.com");
  assert.ok(checkout.id.startsWith("chk_dodo_mock"));
  assert.ok(checkout.url.includes("checkout.dodopayments.com"));

  const sub = await service.createSubscription(customer.id, "price_premium");
  assert.equal(sub.customerId, customer.id);
  assert.equal(sub.priceId, "price_premium");
});

test("Stripe service adapter mock flow", async () => {
  const service = createStripeBillingService({ isMock: true });
  assert.equal(service.providerName, "stripe");

  const customer = await service.createCustomer("test@stripe.com", "Stripe Dev");
  assert.ok(customer.id.startsWith("cust_stripe_mock"));
  assert.equal(customer.email, "test@stripe.com");

  const checkout = await service.createCheckout(customer.id, "price_premium", "https://success.com", "https://cancel.com");
  assert.ok(checkout.id.startsWith("chk_stripe_mock"));
  assert.ok(checkout.url.includes("checkout.stripe.com"));
});

test("Webhook validations and exceptions", async () => {
  const service = createDodoBillingService({ isMock: true });
  const event = await service.validateWebhook('{"type":"payment.succeeded"}', "valid_sig", "secret");
  assert.equal(event.type, "subscription.created");

  await assert.rejects(
    () => service.validateWebhook('{"type":"payment.succeeded"}', "invalid", "secret"),
    (err) => {
      assert.ok(isBillingError(err));
      assert.equal(err.code, "BILLING_WEBHOOK_VERIFICATION_FAILED");
      return true;
    }
  );
});

test("Validated server actions behavior", async () => {
  const service = createDodoBillingService({ isMock: true });
  setGlobalBillingService(service);

  // Success path
  const response = await createCheckoutAction({
    customerId: "cust_mock_1",
    priceId: "price_premium",
    successUrl: "https://success.com",
    cancelUrl: "https://cancel.com",
  });
  assert.equal(response.success, true);
  assert.ok(response.data?.url.includes("price=price_premium"));

  // Failure validation path
  const failedResponse = await createCheckoutAction({
    customerId: "",
    priceId: "price_premium",
    successUrl: "invalid-url",
    cancelUrl: "https://cancel.com",
  });
  assert.equal(failedResponse.success, false);
  assert.equal(failedResponse.error?.code, "BILLING_INTERNAL_ERROR");
});
