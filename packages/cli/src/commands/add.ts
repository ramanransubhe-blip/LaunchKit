import * as fs from "fs";
import * as path from "path";

const PROVIDER_TEMPLATES: Record<string, string> = {
  stripe: `
# Payments (Stripe)
STRIPE_API_KEY=sk_test_51placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
`,
  clerk: `
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
CLERK_SECRET_KEY=sk_test_placeholder
`,
  betterauth: `
# Authentication (Better Auth)
BETTER_AUTH_SECRET=auth_secret_placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3000
`,
  gemini: `
# AI (Google Gemini)
GEMINI_API_KEY=gemini_placeholder
`,
  openai: `
# AI (OpenAI)
OPENAI_API_KEY=sk-proj-placeholder
`,
  anthropic: `
# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-placeholder
`,
  resend: `
# Communication (Resend)
RESEND_API_KEY=re_placeholder
`,
  redis: `
# Cache & Queues (Redis)
REDIS_URL=redis://localhost:6379
`
};

export function handleAddCommand(provider: string, shouldExit: boolean = true): void {
  const normalized = provider.toLowerCase().replace(/[^a-z]/g, "");
  console.log(`\n🔌 [Integration] Configuring provider module: "${provider}"...`);

  const template = PROVIDER_TEMPLATES[normalized];
  if (!template) {
    console.log(`❌ Provider "${provider}" is not recognized. Supported providers: stripe, clerk, betterauth, gemini, openai, anthropic, resend, redis.`);
    if (shouldExit) {
      process.exit(1);
    }
    return;
  }

  const rootDir = process.cwd();
  const envPath = path.join(rootDir, ".env");

  // Read .env if it exists, or create it from .env.example
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  } else {
    const envExamplePath = path.join(rootDir, ".env.example");
    if (fs.existsSync(envExamplePath)) {
      console.log("📝 .env file not found. Copying from .env.example...");
      content = fs.readFileSync(envExamplePath, "utf8");
    } else {
      console.log("📝 .env file not found. Creating new .env file...");
    }
  }

  // Check if provider variables are already configured
  const checkKey = template.trim().split("\n")[1]?.split("=")[0];
  if (checkKey && content.includes(checkKey)) {
    console.log(`⚠️  Provider "${provider}" environment variables are already configured in your .env file.`);
  } else {
    // Append template
    const updatedContent = content.trim() + "\n" + template;
    fs.writeFileSync(envPath, updatedContent, "utf8");
    console.log(`✔️ Injected environment variable templates for ${provider} into .env.`);
  }

  console.log(`🎉 Successfully added and configured ${provider}! Remember to set your actual credentials in .env.\n`);
}
