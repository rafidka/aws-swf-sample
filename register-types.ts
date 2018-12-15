import SWF = require("aws-sdk/clients/swf");
import {
  SWF_DOMAIN,
  SWF_WORKFLOW,
  SWF_WORKFLOW_TASKLIST,
  SWF_RUNCOMMAND_ACTIVITY,
  SWF_RUNCOMMAND_ACTIVITY_TASKLIST,
  SWF_PRINTOUTPUT_ACTIVITY,
  SWF_PRINTOUTPUT_ACTIVITY_TASKLIST,
  initAws
} from "./config";
import chalk from "chalk";

async function registerWorkflowType() {
  const swf = new SWF();

  console.log(`Registering worfklow '${SWF_WORKFLOW}'.`);
  await swf
    .registerWorkflowType({
      domain: SWF_DOMAIN,
      name: SWF_WORKFLOW,
      version: "1.0",
      defaultTaskList: { name: SWF_WORKFLOW_TASKLIST },
      defaultTaskStartToCloseTimeout: "30",
      defaultExecutionStartToCloseTimeout: "30"
    })
    .promise();
}

async function registerActivityType(activityName: string, taskList: string) {
  const swf = new SWF();

  console.log(`Registering activity '${activityName}'.`);
  await swf
    .registerActivityType({
      domain: SWF_DOMAIN,
      name: activityName,
      version: "1.0",
      defaultTaskList: { name: taskList },
      defaultTaskScheduleToStartTimeout: "30",
      defaultTaskStartToCloseTimeout: "600",
      defaultTaskScheduleToCloseTimeout: "630",
      defaultTaskHeartbeatTimeout: "10"
    })
    .promise();
}

async function registerTypes() {
  await registerWorkflowType();
  await registerActivityType(
    SWF_RUNCOMMAND_ACTIVITY,
    SWF_RUNCOMMAND_ACTIVITY_TASKLIST
  );
  await registerActivityType(
    SWF_PRINTOUTPUT_ACTIVITY,
    SWF_PRINTOUTPUT_ACTIVITY_TASKLIST
  );
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
