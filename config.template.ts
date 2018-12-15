import AWS = require("aws-sdk");

const ACCESS_KEY = (() => {
  throw new Error("ACCESS_KEY not set.");
})();
const SECRET_KEY = (() => {
  throw new Error("SECRET_KEY not set.");
})();
const REGION = (() => {
  throw new Error("REGION not set.");
})();
export const S3_RUNCOMMAND_OUTPUT_BUCKET = (() => {
  throw new Error("S3_RUNCOMMAND_OUTPUT_BUCKET not set.");
})();

export const SWF_DOMAIN = "remotejob";
export const SWF_WORKFLOW = "workflow";
export const SWF_WORKFLOW_TASKLIST = "workflow-tasklist";
export const SWF_RUNCOMMAND_ACTIVITY = "runcommand-activity";
export const SWF_RUNCOMMAND_ACTIVITY_TASKLIST = "runcommand-activity-tasklist";
export const SWF_PRINTOUTPUT_ACTIVITY = "printoutput-activity";
export const SWF_PRINTOUTPUT_ACTIVITY_TASKLIST =
  "printoutput-activity-tasklist";

export function initAws() {
  AWS.config.accessKeyId = ACCESS_KEY;
  AWS.config.secretAccessKey = SECRET_KEY;
  AWS.config.region = REGION;
}
