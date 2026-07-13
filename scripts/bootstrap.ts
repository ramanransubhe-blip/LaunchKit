import * as fs from "fs";
import * as path from "path";

const packages = [
  { name: "ui", description: "Design system & UI components using Tailwind CSS v4" },
  { name: "auth", description: "Secure authentication interfaces & hook templates" },
  { name: "database", description: "PostgreSQL schema interface & client configuration" },
  { name: "payments", description: "Stripe & billing gateway integration shells" },
  { name: "ai", description: "LLM abstraction layers & vector store helper functions" },
  { name: "emails", description: "React-email templates & configuration setups" },
  { name: "analytics", description: "Telemetry client wrappers & custom event hooks" },
  { name: "storage", description: "AWS S3 / Supabase Storage file-handling utilities" },
  { name: "config", description: "Strict environment validation schemes & configurations" },
  { name: "types", description: "Centralized TypeScript types & data contracts" },
  { name: "hooks", description: "Shared custom React hooks for state and lifecycle" },
  { name: "utils", description: "Standard utility helpers & string/date formatters" },
  { name: "feature-flags", description: "PostHog / custom feature toggles layer config" },
  { name: "notifications", description: "Slack / Email alert dispatching mechanisms" },
  { name: "search", description: "Algolia / indexing clients & helper methods" },
  { name: "api", description: "Type-safe HTTP client templates & REST/GraphQL API specs" },
  { name: "testing", description: "Playwright, Jest, and MSW custom presets" },
];

const root = path.resolve(__dirname, "..");
const packagesRoot = path.join(root, "packages");

function createDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJson(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function writeFile(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, "utf8");
}

console.log("🚀 Starting Monorepo Packages Bootstrap...");

packages.forEach((pkg) => {
  const pkgDir = path.join(packagesRoot, pkg.name);
  const srcDir = path.join(pkgDir, "src");

  createDirectory(pkgDir);
  createDirectory(srcDir);

  // package.json
  const packageJson = {
    name: `@devlaunchkit/${pkg.name}`,
    version: "1.0.0",
    private: true,
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    scripts: {
      build: "tsc",
      clean: "tsx ../../scripts/clean.ts"
    },
    dependencies: {},
    devDependencies: {
      typescript: "^5.7.2"
    }
  };
  writeJson(path.join(pkgDir, "package.json"), packageJson);

  // tsconfig.json
  const tsconfigJson = {
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      outDir: "./dist",
      rootDir: "./src"
    },
    include: ["src/**/*"]
  };
  writeJson(path.join(pkgDir, "tsconfig.json"), tsconfigJson);

  // README.md
  const readmeContent = `# @devlaunchkit/${pkg.name}\n\n${pkg.description}\n\n## Structure\n\n- \`src/\`: Main source files.\n`;
  writeFile(path.join(pkgDir, "README.md"), readmeContent);

  // src/index.ts
  const indexContent = `// @devlaunchkit/${pkg.name} Entrypoint\n\nexport const info = {\n  name: "${pkg.name}",\n  description: "${pkg.description}"\n};\n`;
  writeFile(path.join(srcDir, "index.ts"), indexContent);

  console.log(`✅ Scaffolded packages/${pkg.name}`);
});

console.log("🎉 All packages successfully scaffolded!");
