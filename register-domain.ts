import SWF = require("aws-sdk/clients/swf");
import { SWF_DOMAIN_NAME, initAws } from "./config";
import chalk from "chalk";

async function registerDomain() {
  console.log(`Registering SWF domain: ${SWF_DOMAIN_NAME}.`);
  return await new SWF()
    .registerDomain({
      name: SWF_DOMAIN_NAME,
      workflowExecutionRetentionPeriodInDays: "1"
    })
    .promise();
}

initAws();

registerDomain().then(
  () => {
    console.log(
      chalk.green(`Domain ${SWF_DOMAIN_NAME} was registered successfully.`)
    );
  },
  reason => {
    console.log(
      chalk.red(`Failed to register ${SWF_DOMAIN_NAME}. Error was:`),
      reason
    );
  }
);
