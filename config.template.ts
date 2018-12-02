import AWS = require("aws-sdk");

const ACCESS_KEY = (() => {
  throw new Error("ACCESS_KEY not set.");
})();
const SECRET_KEY = (() => {
  throw new Error("ACCESS_KEY not set.");
})();
const REGION = (() => {
  throw new Error("ACCESS_KEY not set.");
})();

export const SWF_DOMAIN_NAME = "remote-job-domain";

export function initAws() {
  AWS.config.accessKeyId = ACCESS_KEY;
  AWS.config.secretAccessKey = SECRET_KEY;
  AWS.config.region = REGION;
}
