import SWF = require("aws-sdk/clients/swf");
import { initAws, SWF_DOMAIN, SWF_WORKFLOW } from "./config";
import { v4 as uuid } from "uuid";
import chalk from "chalk";

initAws();

const swf = new SWF();

async function startWorkflow(): Promise<{
  workflowId: string;
  run: SWF.Types.Run;
}> {
  const workflowId = uuid();

  const run: SWF.Types.Run = await swf
    .startWorkflowExecution({
      domain: SWF_DOMAIN,
      workflowId,
      workflowType: { name: SWF_WORKFLOW, version: "1.0" },
      input: "ls",
      childPolicy: "TERMINATE"
    })
    .promise();

  return {
    workflowId,
    run
  };
}

console.log("Starting a new workflow.");
startWorkflow().then(
  response => {
    console.log(
      chalk.green(
        `Workflow started. Workflow ID: ${response.workflowId}. Run ID: ${
          response.run.runId
        } `
      )
    );
  },
  reason => {
    console.log(chalk.red("Failed to start workflow. Reason: "), reason);
  }
);
