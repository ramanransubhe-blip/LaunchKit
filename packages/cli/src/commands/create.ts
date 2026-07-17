import * as fs from "fs";
import * as path from "path";

export function handleCreateCommand(projectName: string, shouldExit: boolean = true): void {
  console.log(`\n🚀 [Scaffold] Initializing new SaaS application: "${projectName}"...`);

  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Directory "${projectName}" already exists.`);
    if (shouldExit) {
      process.exit(1);
    }
    return;
  }

  try {
    // Create directory structure
    fs.mkdirSync(targetDir, { recursive: true });
    fs.mkdirSync(path.join(targetDir, "src"), { recursive: true });

    // Write package.json
    const packageJson = {
      name: projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        next: "^15.1.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        "@devlaunchkit/ui": "workspace:*",
        "@devlaunchkit/auth": "workspace:*",
        "@devlaunchkit/payments": "workspace:*",
        "@devlaunchkit/env": "workspace:*",
      },
    };
    fs.writeFileSync(
      path.join(targetDir, "package.json"),
      JSON.stringify(packageJson, null, 2),
      "utf8"
    );

    // Write tsconfig.json
    const tsconfigJson = {
      extends: "../tsconfig.base.json",
      compilerOptions: {
        target: "ES2022",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
      },
      include: ["src/**/*"],
    };
    fs.writeFileSync(
      path.join(targetDir, "tsconfig.json"),
      JSON.stringify(tsconfigJson, null, 2),
      "utf8"
    );

    // Write README.md
    const readmeContent = `# ${projectName}\n\nThis application was scaffolded using the DevLaunchKit CLI.\n\n## Getting Started\n\n1. Install dependencies in root: \`pnpm install\`\n2. Copy environment variables: \`cp .env.example .env\`\n3. Run diagnostics: \`pnpm doctor\`\n4. Start dev server: \`pnpm dev\`\n`;
    fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent, "utf8");

    // Write simple src/index.ts
    const indexContent = `// ${projectName} Entrypoint\nexport const appName = "${projectName}";\n`;
    fs.writeFileSync(path.join(targetDir, "src/index.ts"), indexContent, "utf8");

    console.log("✔️ Scaffolded folder structure templates...");
    console.log("✔️ Linked @devlaunchkit design tokens, billing client, and auth core packages...");
    console.log(
      `\n🎉 Successfully created SaaS project! Run:\n   cd ${projectName}\n   pnpm install\n`
    );
  } catch (error: any) {
    console.error(`❌ Failed to scaffold project:`, error.message || error);
    if (shouldExit) {
      process.exit(1);
    }
  }
}
