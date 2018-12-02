import SWF = require("aws-sdk/clients/swf");
import {
  SWF_DOMAIN_NAME,
  SWF_WORKFLOW_NAME,
  SWF_ACTIVITY_NAME,
  SWF_TASKLIST_NAME,
  initAws
} from "./config";
import chalk from "chalk";

async function registerWorkflowType() {
  const swf = new SWF();

  console.log(`Registering worfklow ${SWF_WORKFLOW_NAME}.`);
  await swf
    .registerWorkflowType({
      domain: SWF_DOMAIN_NAME,
      name: SWF_WORKFLOW_NAME,
      version: "1.0",
      defaultTaskList: { name: SWF_TASKLIST_NAME },
      defaultTaskStartToCloseTimeout: "30",
      defaultExecutionStartToCloseTimeout: "30"
    })
    .promise();
}

async function registerActivityType() {
  const swf = new SWF();

  console.log(`Registering activity ${SWF_ACTIVITY_NAME}.`);
  await swf
    .registerActivityType({
      domain: SWF_DOMAIN_NAME,
      name: SWF_ACTIVITY_NAME,
      version: "1.0",
      defaultTaskList: { name: SWF_TASKLIST_NAME },
      defaultTaskScheduleToStartTimeout: "30",
      defaultTaskStartToCloseTimeout: "600",
      defaultTaskScheduleToCloseTimeout: "630",
      defaultTaskHeartbeatTimeout: "10"
    })
    .promise();
}

async function registerTypes() {
  await registerWorkflowType();
  await registerActivityType();
}

initAws();

registerTypes().then(
  () => {
    console.log(
      chalk.green(`Necessary SWF types were registered successfully.`)
    );
  },
  reason => {
    console.log(
      chalk.red(
        `Failed to register some or all of the required SWF types. Error was:`
      ),
      reason
    );
  }
);
