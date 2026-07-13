import { Command } from "commander";
import { handleCreateCommand } from "./commands/create.js";
import { handleAddCommand } from "./commands/add.js";
import { handleDoctorCommand } from "./commands/doctor.js";

const program = new Command();

program
  .name("devlaunchkit")
  .description("Official DevLaunchKit command-line developer operations and scaffoldings helper CLI")
  .version("1.0.0");

program
  .command("create")
  .argument("<project-name>", "Name of the new SaaS project to scaffold")
  .description("Scaffolds a new project utilizing standard DevLaunchKit structural configurations")
  .action((projectName: string) => {
    handleCreateCommand(projectName);
  });

program
  .command("add")
  .argument("<provider>", "Name of the integration provider (e.g. stripe, clerk, gemini)")
  .description("Configures and adds payment, authentication, or AI providers modules")
  .action((provider: string) => {
    handleAddCommand(provider);
  });

program
  .command("doctor")
  .description("Diagnoses local setup configurations, database, and environment parameters")
  .action(() => {
    handleDoctorCommand();
  });

program.parse(process.argv);
