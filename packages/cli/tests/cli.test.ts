import { test } from "node:test";
import * as assert from "node:assert";
import { handleCreateCommand } from "../src/commands/create.js";
import { handleAddCommand } from "../src/commands/add.js";
import { handleDoctorCommand } from "../src/commands/doctor.js";

test("CLI Create command simulation", () => {
  let logOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => { logOutput += msg + "\n"; };

  try {
    handleCreateCommand("saas-demo");
    assert.ok(logOutput.includes("Initializing new SaaS application"));
    assert.ok(logOutput.includes("saas-demo"));
  } finally {
    console.log = originalLog;
  }
});

test("CLI Add command simulation", () => {
  let logOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => { logOutput += msg + "\n"; };

  try {
    handleAddCommand("stripe");
    assert.ok(logOutput.includes("Installing provider module"));
    assert.ok(logOutput.includes("stripe"));
  } finally {
    console.log = originalLog;
  }
});

test("CLI Doctor command simulation", () => {
  let logOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => { logOutput += msg + "\n"; };

  try {
    handleDoctorCommand();
    assert.ok(logOutput.includes("Assessing LaunchKit system health"));
    assert.ok(logOutput.includes("Node.js runtime: OK"));
  } finally {
    console.log = originalLog;
  }
});
