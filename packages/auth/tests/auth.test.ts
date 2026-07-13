import test from "node:test";
import assert from "node:assert/strict";
import {
  createBetterAuthService,
  createClerkService,
  UserRole,
  OrganizationRole,
} from "../src/index.js";
import { createAuthRouteHandler } from "../src/routes/next.js";
import { createAuthMiddleware } from "../src/middleware/index.js";
import {
  setGlobalAuthService,
  loginAction,
  logoutAction,
} from "../src/server/index.js";

const MOCK_CONFIG = {
  baseUrl: "http://localhost:3000",
  secret: "super_secret_signing_key_32_bytes_long",
  isMock: true,
};

test("Better Auth service and Clerk service initialization", async () => {
  const betterAuth = createBetterAuthService(MOCK_CONFIG);
  const clerk = createClerkService(MOCK_CONFIG);

  assert.equal(betterAuth.provider, "better-auth");
  assert.equal(clerk.provider, "clerk");
});

test("signIn and signUp operations on Better Auth mock adapter", async () => {
  const betterAuth = createBetterAuthService(MOCK_CONFIG);
  const credentials = {
    email: "user@example.com",
    password: "Password123!",
  };

  const result = await betterAuth.signIn(credentials);
  assert.equal(result.user.email, "user@example.com");
  assert.equal(result.session.userId, result.user.id);
  assert.equal(result.session.token, "tok_mock_better_auth");
});

test("Organization creation and invitations on Clerk mock adapter", async () => {
  const clerk = createClerkService(MOCK_CONFIG);

  const org = await clerk.createOrganization("usr_mock_clerk", {
    name: "Clerk test org",
  });
  assert.equal(org.name, "Clerk test org");
  assert.equal(org.id, "org_mock_clerk");

  const invite = await clerk.inviteToOrganization(
    org.id,
    "invited@example.com",
    OrganizationRole.Admin,
  );
  assert.equal(invite.email, "invited@example.com");
  assert.equal(invite.role, OrganizationRole.Admin);
});

test("API Routes Handler routes requests to AuthService operations", async () => {
  const betterAuth = createBetterAuthService(MOCK_CONFIG);
  const handler = createAuthRouteHandler(betterAuth);

  const request = new Request("http://localhost:3000/api/auth/signIn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "api@example.com",
      password: "Password123!",
    }),
  });

  const response = await handler.handle(request);
  assert.equal(response.status, 200);

  const body = (await response.json()) as any;
  assert.equal(body.success, true);
  assert.equal(body.data.user.email, "api@example.com");
});

test("Server actions call the registered global AuthService", async () => {
  const betterAuth = createBetterAuthService(MOCK_CONFIG);
  setGlobalAuthService(betterAuth);

  const response = await loginAction({
    email: "action@example.com",
    password: "Password123!",
  });

  assert.equal(response.success, true);
  assert.equal(response.data?.user.email, "action@example.com");

  const logoutResponse = await logoutAction("sess_mock_better_auth");
  assert.equal(logoutResponse.success, true);
});

test("Route protected middleware handles redirects", async () => {
  const middleware = createAuthMiddleware({
    policy: {
      signInPath: "/login",
      selectOrganizationPath: "/select-org",
      forbiddenPath: "/403",
      protected: { prefix: ["/app"] },
      organization: { prefix: ["/org"] },
      admin: { prefix: ["/admin"] },
    },
  });

  // Guest requesting protected page -> Redirect to login
  const guestResult = middleware({
    url: "http://localhost/app/dashboard",
    pathname: "/app/dashboard",
    context: null,
  });

  assert.equal(guestResult.action, "redirect");
  assert.ok(guestResult.location.startsWith("/login?next="));

  // User requesting admin page -> Redirect to forbidden path
  const userResult = middleware({
    url: "http://localhost/admin/users",
    pathname: "/admin/users",
    context: {
      isAuthenticated: true,
      user: {
        id: "usr_1",
        email: "user@example.com",
        name: "User",
        image: null,
        role: UserRole.User,
        emailVerified: true,
        emailVerifiedAt: null,
        organizationId: null,
        organizationIds: [],
        permissions: [],
        subscription: null,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "sess_1",
        token: "tok_1",
        userId: "usr_1",
        expiresAt: new Date(Date.now() + 100000),
        userAgent: null,
        ipAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      organization: null,
      roles: [UserRole.User],
      permissions: [],
      metadata: null,
    },
  });

  assert.equal(userResult.action, "redirect");
  assert.equal(userResult.location, "/403");
});
