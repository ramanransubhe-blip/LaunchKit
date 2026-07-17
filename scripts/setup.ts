import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const root = path.resolve(__dirname, "..");

console.log("🔧 Starting workspace environment setup...");

try {
  console.log("📦 Initializing Git Hooks (Husky)...");
  execSync("npx husky", { cwd: root, stdio: "inherit" });

  const huskyDir = path.join(root, ".husky");
  if (fs.existsSync(huskyDir)) {
    const commitMsgHook = path.join(huskyDir, "commit-msg");
    const preCommitHook = path.join(huskyDir, "pre-commit");

    fs.writeFileSync(commitMsgHook, `npx --no -- commitlint --edit "$1"\n`, "utf8");
    fs.writeFileSync(preCommitHook, `npx lint-staged\n`, "utf8");

    try {
      fs.chmodSync(commitMsgHook, 0o755);
      fs.chmodSync(preCommitHook, 0o755);
    } catch {}
    console.log("✅ Git hooks configured successfully!");
  } else {
    console.log("⚠️ .husky directory not found. Husky initialization might have failed.");
  }
} catch (error: any) {
  console.error("❌ Setup failed:", error.message || error);
}
