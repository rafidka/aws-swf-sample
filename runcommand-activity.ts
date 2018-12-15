import { v4 as uuid } from "uuid";
import SWF = require("aws-sdk/clients/swf");
import S3 = require("aws-sdk/clients/s3");
import { exec } from "shelljs";
import {
  initAws,
  SWF_DOMAIN,
  SWF_RUNCOMMAND_ACTIVITY_TASKLIST,
  S3_RUNCOMMAND_OUTPUT_BUCKET
} from "./config";
import chalk from "chalk";

initAws();

const swf = new SWF();
const s3 = new S3();

interface ExecCommandOutput {
  stdout: string;
  stderr: string;
}

async function execCommand(command: string): Promise<ExecCommandOutput> {
  return new Promise<ExecCommandOutput>((resolve, reject) => {
    exec(
      command,
      { encoding: "utf8", silent: false },
      (code, stdout, stderr) => {
        if (code) {
          reject({ code, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

async function uploadToS3(activityId: string, body: string): Promise<string> {
  const key = `${activityId}-output.json`;
  await s3
    .putObject({
      Bucket: S3_RUNCOMMAND_OUTPUT_BUCKET,
      Key: key,
      ContentType: "application/json",
      Body: body
    })
    .promise();
  return key;
}

async function run() {
  while (true) {
    console.log("Polling for activity tasks...");
    const activityTask: SWF.Types.ActivityTask = await swf
      .pollForActivityTask({
        domain: SWF_DOMAIN,
        taskList: { name: SWF_RUNCOMMAND_ACTIVITY_TASKLIST }
      })
      .promise();
    console.log("Received an activity task: ", activityTask);

    if (activityTask.taskToken) {
      const input = activityTask.input;
      console.log("Received the following command to execute: " + input);

      try {
        const { stdout, stderr } = await execCommand(input);
        console.log("Uploading the output to S3.");
        const key = await uploadToS3(
          activityTask.activityId,
          JSON.stringify({ stdout, stderr }, null, 2)
        );
        console.log(`File uploaded successfully. Key is ${key}.`);
        await swf
          .respondActivityTaskCompleted({
            taskToken: activityTask.taskToken,
            result: key
          })
          .promise();
      } catch ({ code, stderr }) {
        await swf
          .respondActivityTaskFailed({
            taskToken: activityTask.taskToken,
            reason: JSON.stringify({ code, stderr })
          })
          .promise();
      }
    }
  }
}

run();
