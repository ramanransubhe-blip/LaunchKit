import { db } from "../utils/connection";
import * as schema from "../schema";

async function main() {
  console.log("🌱 Database seeding started...");

  try {
    // 1. Seed Roles
    console.log("  - Seeding default Roles...");
    const roleRows = await db
      .insert(schema.roles)
      .values([
        { name: "owner", description: "Organization Owner" },
        { name: "admin", description: "Platform Administrator" },
        { name: "member", description: "General Organization Member" },
        { name: "guest", description: "Read-only Guest Participant" },
      ])
      .onConflictDoNothing()
      .returning();

    // Map role names to IDs
    const roleMap: Record<string, string> = {};
    const existingRoles = await db.select().from(schema.roles);
    existingRoles.forEach((r) => {
      roleMap[r.name] = r.id;
    });

    // 2. Seed Permissions
    console.log("  - Seeding default Permissions...");
    const permissionRows = await db
      .insert(schema.permissions)
      .values([
        { name: "all", description: "Super Admin privileges" },
        { name: "read:billing", description: "Read billing and subscriptions status" },
        { name: "write:billing", description: "Modify billing plans and coupons" },
        { name: "read:settings", description: "View workspace properties" },
        { name: "write:settings", description: "Edit workspace parameters" },
      ])
      .onConflictDoNothing()
      .returning();

    // 3. Seed Super Admin User Profile
    console.log("  - Seeding admin/user Profiles...");
    const adminProfiles = await db
      .insert(schema.profiles)
      .values([
        {
          email: "admin@devlaunchkit.com",
          name: "Super Administrator",
          avatarUrl: "https://avatar.vercel.sh/admin",
        },
        {
          email: "user@devlaunchkit.com",
          name: "Test Developer",
          avatarUrl: "https://avatar.vercel.sh/test-user",
        },
      ])
      .onConflictDoNothing()
      .returning();

    const existingProfiles = await db.select().from(schema.profiles);
    const adminUser = existingProfiles.find((p) => p.email === "admin@devlaunchkit.com");
    const testUser = existingProfiles.find((p) => p.email === "user@devlaunchkit.com");

    if (adminUser && roleMap.admin) {
      await db
        .insert(schema.userRoles)
        .values({
          profileId: adminUser.id,
          roleId: roleMap.admin,
        })
        .onConflictDoNothing();
    }

    // 4. Seed Organization
    console.log("  - Seeding Tenant Organization...");
    const orgs = await db
      .insert(schema.organizations)
      .values({
        name: "Acme DevLabs",
        slug: "acme-devlabs",
        logoUrl: "https://logo.vercel.sh/acme",
      })
      .onConflictDoNothing()
      .returning();

    const existingOrgs = await db.select().from(schema.organizations);
    const org = existingOrgs.find((o) => o.slug === "acme-devlabs");

    if (org && testUser && roleMap.owner) {
      // Add test user as Owner of org
      await db
        .insert(schema.organizationMembers)
        .values({
          organizationId: org.id,
          profileId: testUser.id,
          roleId: roleMap.owner,
        })
        .onConflictDoNothing();
    }

    // 5. Seed Billing Plan, Product, and Price
    console.log("  - Seeding Billing Plans & Products...");
    const plansRows = await db
      .insert(schema.plans)
      .values({
        name: "Pro Tier Plan",
        description: "Standard plan for growing development teams",
      })
      .onConflictDoNothing()
      .returning();

    const existingPlans = await db.select().from(schema.plans);
    const plan = existingPlans[0];

    if (plan) {
      const prodRows = await db
        .insert(schema.products)
        .values({
          planId: plan.id,
          name: "LaunchKit Pro",
          description: "All-in-one Next.js SaaS monorepo tools",
        })
        .onConflictDoNothing()
        .returning();

      const existingProds = await db.select().from(schema.products);
      const prod = existingProds[0];

      if (prod) {
        await db
          .insert(schema.prices)
          .values({
            productId: prod.id,
            currency: "usd",
            unitAmount: 4900, // $49.00
            type: "recurring",
            interval: "month",
          })
          .onConflictDoNothing();
      }
    }

    // 6. Seed Feature Flags
    console.log("  - Seeding default Feature Flags...");
    await db
      .insert(schema.featureFlags)
      .values([
        {
          key: "beta:ai-assistant",
          description: "Allows access to the experimental AI Chat window panel.",
          defaultValue: true,
        },
        {
          key: "billing:coupons",
          description: "Enables promo coupon codes inside checkout drawer summaries.",
          defaultValue: false,
        },
      ])
      .onConflictDoNothing();

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding error:", error);
    process.exit(1);
  }
}

// Check if run directly
if (import.meta.url.startsWith("file:")) {
  const modulePath = new URL(import.meta.url).pathname;
  if (process.argv[1] && (process.argv[1] === modulePath || process.argv[1].endsWith("index.ts"))) {
    main();
  }
}
export { main };
