import { execSync } from "child_process";
import * as path from "path";

const root = path.resolve(__dirname, "..");

console.log("🔍 Running workspace architecture verification...");

function runCommand(command: string) {
  console.log(`\n🏃 Running: ${command}...`);
  try {
    execSync(command, { cwd: root, stdio: "inherit" });
    console.log(`✅ Success: ${command}`);
  } catch (error: any) {
    console.error(`❌ Failed: ${command}`);
    process.exit(1);
  }
}

runCommand("pnpm typecheck");
runCommand("pnpm build");
runCommand("pnpm lint");

console.log("\n🎉 Workspace verification passed successfully!");
