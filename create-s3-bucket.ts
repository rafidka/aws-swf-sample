import S3 = require("aws-sdk/clients/s3");
import { initAws, S3_RUNCOMMAND_OUTPUT_BUCKET } from "./config";
import chalk from "chalk";

initAws();

const s3 = new S3();

s3.createBucket({
  Bucket: S3_RUNCOMMAND_OUTPUT_BUCKET
})
  .promise()
  .then(
    () => {
      console.log(
        chalk.green(
          `S3 bucket ${S3_RUNCOMMAND_OUTPUT_BUCKET} created successfully.`
        )
      );
    },
    reason => {
      console.log(chalk.red(`Failed to create S3 bucket. Error was:`), reason);
    }
  );
