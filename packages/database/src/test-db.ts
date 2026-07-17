import { checkDatabaseHealth, UserRepository } from "./index";

async function run() {
  console.log("🔍 Running connection checks...");
  const health = await checkDatabaseHealth();
  console.log("Database status:", health);

  if (health.status === "healthy") {
    console.log("🚀 Testing UserRepository findMany query...");
    const userRepo = new UserRepository();
    try {
      const list = await userRepo.findMany({ limit: 5 });
      console.log("Query completed successfully. Users found:", list.length);
    } catch (e) {
      console.warn(
        "⚠️ Query failed (this is expected if database tables have not been created yet):",
        e
      );
    }
  } else {
    console.warn("⚠️ Database is not reachable. Ensure postgres container is running.");
  }
}

// Execute if run directly
if (import.meta.url.startsWith("file:")) {
  const modulePath = new URL(import.meta.url).pathname;
  if (
    process.argv[1] &&
    (process.argv[1] === modulePath || process.argv[1].endsWith("test-db.ts"))
  ) {
    run();
  }
}
export { run };
