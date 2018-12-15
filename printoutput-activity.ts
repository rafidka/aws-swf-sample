import SWF = require("aws-sdk/clients/swf");
import S3 = require("aws-sdk/clients/s3");
import {
  initAws,
  SWF_DOMAIN,
  SWF_PRINTOUTPUT_ACTIVITY_TASKLIST,
  S3_RUNCOMMAND_OUTPUT_BUCKET
} from "./config";

initAws();

const swf = new SWF();
const s3 = new S3();

async function downloadFromS3(key: string): Promise<string> {
  return (await s3
    .getObject({
      Bucket: S3_RUNCOMMAND_OUTPUT_BUCKET,
      Key: key
    })
    .promise()).Body.toString("utf-8");
}

async function run() {
  while (true) {
    console.log("Polling for activity tasks...");
    const activityTask: SWF.Types.ActivityTask = await swf
      .pollForActivityTask({
        domain: SWF_DOMAIN,
        taskList: { name: SWF_PRINTOUTPUT_ACTIVITY_TASKLIST }
      })
      .promise();
    console.log("Received an activity task: ", activityTask);

    if (activityTask.taskToken) {
      const s3FileKey = activityTask.input;
      console.log(
        `Downloading the file ${s3FileKey} from the S3 bucket ${S3_RUNCOMMAND_OUTPUT_BUCKET}.`
      );
      const body = await downloadFromS3(s3FileKey);
      console.log("File downloaded successfully. Printing it: ");
      console.log(body);
      await swf
        .respondActivityTaskCompleted({
          taskToken: activityTask.taskToken
        })
        .promise();
    }
  }
}

run();
