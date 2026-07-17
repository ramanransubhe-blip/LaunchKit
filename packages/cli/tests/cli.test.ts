import { test, before, after } from "node:test";
import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { handleCreateCommand } from "../src/commands/create.js";
import { handleAddCommand } from "../src/commands/add.js";
import { handleDoctorCommand } from "../src/commands/doctor.js";

const cleanup = () => {
  const saasDemoPath = path.resolve(process.cwd(), "saas-demo");
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(saasDemoPath)) {
    fs.rmSync(saasDemoPath, { recursive: true, force: true });
  }
  if (fs.existsSync(envPath)) {
    fs.rmSync(envPath, { force: true });
  }
};

before(() => {
  cleanup();
});

after(() => {
  cleanup();
});

test("CLI Create command simulation", () => {
  let logOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => {
    logOutput += msg + "\n";
  };

  try {
    handleCreateCommand("saas-demo", false);
    assert.ok(logOutput.includes("Initializing new SaaS application"));
    assert.ok(logOutput.includes("saas-demo"));
  } finally {
    console.log = originalLog;
  }
});

test("CLI Add command simulation", () => {
  let logOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => {
    logOutput += msg + "\n";
  };

  try {
    handleAddCommand("stripe", false);
    assert.ok(logOutput.includes("Configuring provider module"));
    assert.ok(logOutput.includes("stripe"));
  } finally {
    console.log = originalLog;
  }
});

test("CLI Doctor command simulation", async () => {
  let logOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => {
    logOutput += msg + "\n";
  };

  try {
    await handleDoctorCommand(false);
    assert.ok(logOutput.includes("system health"));
    assert.ok(logOutput.includes("Node.js runtime: OK"));
  } finally {
    console.log = originalLog;
  }
});
