import * as fs from "fs";
import * as path from "path";

const root = path.resolve(__dirname, "..");

const targets = ["node_modules", ".next", "dist", ".turbo"];

function deleteRecursive(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️ Deleting: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function scanAndClean(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (targets.includes(file)) {
        deleteRecursive(fullPath);
      } else {
        scanAndClean(fullPath);
      }
    }
  }
}

console.log("🧹 Starting workspace clean-up...");

targets.forEach((target) => {
  const rootTarget = path.join(root, target);
  deleteRecursive(rootTarget);
});

const appsDir = path.join(root, "apps");
if (fs.existsSync(appsDir)) {
  scanAndClean(appsDir);
}

const packagesDir = path.join(root, "packages");
if (fs.existsSync(packagesDir)) {
  scanAndClean(packagesDir);
}

console.log("✅ Workspace clean-up finished!");
