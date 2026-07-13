import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { envSchema } from "@devlaunchkit/env";
import { checkDatabaseHealth } from "@devlaunchkit/database";

// ANSI Color Escape Codes
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";

function logSuccess(message: string) {
  console.log(`  🟢 ${GREEN}${message}${RESET}`);
}

function logWarning(message: string) {
  console.log(`  🟡 ${YELLOW}${message}${RESET}`);
}

function logError(message: string) {
  console.log(`  🔴 ${RED}${BOLD}${message}${RESET}`);
}

function logSection(title: string) {
  console.log(`\n${BOLD}${CYAN}=== ${title} ===${RESET}\n`);
}

export async function handleDoctorCommand(): Promise<void> {
  console.log(`\n${BOLD}🩺 [Diagnostics] Assessing DevLaunchKit system health...${RESET}\n`);
  
  let hasErrors = false;
  let hasWarnings = false;

  // 1. RUNTIME & SYSTEM CHECKS
  logSection("1. Runtime & Environment System");
  
  // Node version check
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (nodeMajor >= 20) {
    logSuccess(`Node.js runtime: OK (${nodeVersion})`);
  } else {
    logError(`Node.js runtime: FAILED (Current: ${nodeVersion}, Required: >= v20)`);
    hasErrors = true;
  }

  // pnpm check
  try {
    const pnpmVersionStr = execSync("pnpm -v", { encoding: "utf8" }).trim();
    const pnpmMajor = parseInt(pnpmVersionStr.split(".")[0], 10);
    if (pnpmMajor >= 9) {
      logSuccess(`pnpm manager: OK (v${pnpmVersionStr})`);
    } else {
      logWarning(`pnpm manager: WARNING (Current: v${pnpmVersionStr}, Recommended: >= v9)`);
      hasWarnings = true;
    }
  } catch {
    logError("pnpm manager: FAILED (pnpm command not found or not in PATH)");
    hasErrors = true;
  }

  // node_modules check
  const rootDir = process.cwd();
  const rootNodeModules = path.join(rootDir, "node_modules");
  if (fs.existsSync(rootNodeModules)) {
    logSuccess("Workspace dependencies: OK (node_modules exists)");
  } else {
    logError("Workspace dependencies: FAILED (node_modules missing in root. Run: pnpm install)");
    hasErrors = true;
  }

  // 2. ENVIRONMENT FILES & CONFIGURATION
  logSection("2. Environment Variables Validation");

  const envPath = path.join(rootDir, ".env");
  const envLocalPath = path.join(rootDir, ".env.local");

  let envExists = fs.existsSync(envPath);
  let envLocalExists = fs.existsSync(envLocalPath);

  if (envExists || envLocalExists) {
    logSuccess(`Environment files detected (${envExists ? ".env " : ""}${envLocalExists ? ".env.local" : ""})`);
    
    // Parse environment variables loaded into process.env
    // Validate with envSchema
    const parsed = envSchema.safeParse(process.env);
    if (parsed.success) {
      logSuccess("Environment variable schema: OK (Zod verification passed)");
    } else {
      logWarning("Environment variable schema: WARNING (Some variables failed strict parsing)");
      const errors = parsed.error.flatten().fieldErrors;
      for (const [key, messages] of Object.entries(errors)) {
        const msgs = messages as string[] | undefined;
        console.log(`     ⚠️  ${key}: ${msgs?.join(", ")}`);
      }
      hasWarnings = true;
    }

    // Check specific credentials placeholders
    const checks = [
      { key: "DATABASE_URL", label: "Database Connection Link", required: true },
      { key: "AUTH_SECRET_KEY", label: "Authentication Secret", required: false },
      { key: "STRIPE_API_KEY", label: "Stripe API Key", required: false },
      { key: "OPENAI_API_KEY", label: "OpenAI API Key", required: false },
      { key: "RESEND_API_KEY", label: "Resend API Key", required: false }
    ];

    checks.forEach((item) => {
      const val = process.env[item.key];
      if (!val) {
        if (item.required) {
          logError(`Required key missing: ${item.key} (${item.label})`);
          hasErrors = true;
        } else {
          logWarning(`Optional key missing: ${item.key} (${item.label})`);
          hasWarnings = true;
        }
      } else if (val === "your_key" || val.includes("your_") || val.includes("placeholder")) {
        if (item.required) {
          logError(`Placeholder detected in required key: ${item.key}`);
          hasErrors = true;
        } else {
          logWarning(`Placeholder detected in optional key: ${item.key}`);
          hasWarnings = true;
        }
      } else {
        logSuccess(`Configured key: ${item.key} is valid`);
      }
    });

  } else {
    logError("Environment configuration: FAILED (No .env or .env.local file found. Copy .env.example to start.)");
    hasErrors = true;
  }

  // 3. DATABASE STATUS CHECKS
  logSection("3. Database Connectivity");
  
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("your_key")) {
    try {
      const dbHealth = await checkDatabaseHealth();
      if (dbHealth.status === "healthy") {
        logSuccess(`Database connectivity: OK (Latency: ${dbHealth.latencyMs}ms)`);
      } else {
        logError(`Database connectivity: FAILED (Error: ${dbHealth.error})`);
        console.log(`     💡 Tip: Make sure your PostgreSQL docker container is running: docker-compose up -d`);
        hasErrors = true;
      }
    } catch (e: any) {
      logError(`Database connectivity: FAILED (${e.message || String(e)})`);
      hasErrors = true;
    }
  } else {
    logError("Database connectivity: SKIPPED (DATABASE_URL environment variable is missing or placeholder)");
    hasErrors = true;
  }

  // 4. INTEGRATION PLATFORMS / PROVIDERS DETECTED
  logSection("4. Integration Platforms & Adapters");

  // Auth Provider
  const authProvider = process.env.NEXT_PUBLIC_AUTH_PROVIDER_KEY ? "Clerk" : "Better Auth";
  logSuccess(`Authentication Active Adaptor: ${authProvider}`);

  // Payments Provider
  const paymentsProvider = process.env.STRIPE_API_KEY ? "Stripe" : "Dodo Payments (Default)";
  logSuccess(`Payments Active Adaptor: ${paymentsProvider}`);

  // AI Provider
  const aiProvider = (process.env.OPENAI_API_KEY && process.env.ANTHROPIC_API_KEY) 
    ? "OpenAI & Anthropic" 
    : process.env.OPENAI_API_KEY 
    ? "OpenAI" 
    : process.env.ANTHROPIC_API_KEY 
    ? "Anthropic" 
    : "Gemini (Fallback)";
  logSuccess(`AI Active Gateway: ${aiProvider}`);

  // Resend Email
  if (process.env.RESEND_API_KEY) {
    logSuccess("Communication Active: Resend SMTP Service");
  } else {
    logWarning("Communication Active: Mock SMTP Client (Configure RESEND_API_KEY for production)");
    hasWarnings = true;
  }

  // Redis Cache / Queue
  if (process.env.REDIS_URL) {
    logSuccess("Distributed Cache/Queue: Redis (BullMQ ready)");
  } else {
    logWarning("Distributed Cache/Queue: In-memory Cache & Local queue (bullmq will not work without redis)");
    hasWarnings = true;
  }

  // 5. SUMMARY
  console.log(`\n${BOLD}========================================${RESET}`);
  if (hasErrors) {
    console.log(`\n❌ ${RED}${BOLD}LaunchKit diagnostics failed. Please fix critical errors listed above before starting the app.${RESET}\n`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`\n⚠️  ${YELLOW}${BOLD}LaunchKit diagnostics passed with warnings. Optional provider systems may run in mock mode.${RESET}\n`);
  } else {
    console.log(`\n🎉 ${GREEN}${BOLD}All DevLaunchKit environment systems check out cleanly! Ready for launch.${RESET}\n`);
  }
}
