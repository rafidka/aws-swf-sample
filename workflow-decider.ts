import * as _ from "lodash";
import { v4 as uuid } from "uuid";
import SWF = require("aws-sdk/clients/swf");
import {
  initAws,
  SWF_DOMAIN,
  SWF_WORKFLOW_TASKLIST,
  SWF_RUNCOMMAND_ACTIVITY,
  SWF_PRINTOUTPUT_ACTIVITY
} from "./config";
import chalk from "chalk";

initAws();

const swf = new SWF();

function getWorkflowInput(events: SWF.Types.HistoryEventList) {
  const executionStartedEvent = _.find(
    events,
    e => e.eventType === "WorkflowExecutionStarted"
  );
  if (!executionStartedEvent) {
    throw new Error("Couldn't find WorkflowExecutionStarted event in history.");
  }
  return executionStartedEvent.workflowExecutionStartedEventAttributes.input;
}

function getLastCompletedActivityType(events: SWF.Types.HistoryEventList) {
  const e = _.findLast(events, e => e.eventType === "ActivityTaskCompleted");

  if (!e) {
    return null;
  }
  var scheduledEventId =
    e.activityTaskCompletedEventAttributes.scheduledEventId;
  var scheduledEvent = _.find(events, e => e.eventId == scheduledEventId);
  return scheduledEvent.activityTaskScheduledEventAttributes.activityType.name;
}

function getLastActivityResult(events: SWF.Types.HistoryEventList) {
  // The first activity executed is the run-command activity so if there is any
  // completed activity, it means run-command activity is completed.
  const event = _.findLast(
    events,
    e => e.eventType === "ActivityTaskCompleted"
  );
  return event.activityTaskCompletedEventAttributes.result;
}

async function scheduleRunCommandActivity(
  decisionTaskToken: string,
  input: string
) {
  console.log(chalk.blue(`Scedule '${SWF_RUNCOMMAND_ACTIVITY}' activity.`));
  await swf
    .respondDecisionTaskCompleted({
      taskToken: decisionTaskToken,
      decisions: [
        {
          decisionType: "ScheduleActivityTask",
          scheduleActivityTaskDecisionAttributes: {
            activityType: {
              name: SWF_RUNCOMMAND_ACTIVITY,
              version: "1.0"
            },
            activityId: uuid(),
            input: input
          }
        }
      ]
    })
    .promise();
}

async function schedulePrintOutputActivity(
  decisionTaskToken: string,
  result: string
) {
  console.log(chalk.blue(`Scedule '${SWF_PRINTOUTPUT_ACTIVITY}' activity.`));
  await swf
    .respondDecisionTaskCompleted({
      taskToken: decisionTaskToken,
      decisions: [
        {
          decisionType: "ScheduleActivityTask",
          scheduleActivityTaskDecisionAttributes: {
            activityType: {
              name: SWF_PRINTOUTPUT_ACTIVITY,
              version: "1.0"
            },
            activityId: uuid(),
            input: result
          }
        }
      ]
    })
    .promise();
}

async function completeWorkflow(decisionTaskToken: string) {
  console.log(chalk.blue(`Complete workflow.`));
  await swf
    .respondDecisionTaskCompleted({
      taskToken: decisionTaskToken,
      decisions: [
        {
          decisionType: "CompleteWorkflowExecution"
        }
      ]
    })
    .promise();
}

async function run() {
  while (true) {
    console.log("Polling for decisions task...");
    const decisionTask: SWF.Types.DecisionTask = await swf
      .pollForDecisionTask({
        domain: SWF_DOMAIN,
        taskList: { name: SWF_WORKFLOW_TASKLIST }
      })
      .promise();

    const decisionTaskToken = decisionTask.taskToken;
    if (decisionTaskToken) {
      console.log("Received a decision task: ", JSON.stringify(decisionTask));

      const lastTask = getLastCompletedActivityType(decisionTask.events);
      switch (lastTask) {
        case null:
          // No activity started yet. Start the runcommand activity.
          const input = getWorkflowInput(decisionTask.events);
          await scheduleRunCommandActivity(decisionTaskToken, input);
          break;

        case SWF_RUNCOMMAND_ACTIVITY:
          // runcommand activity completed; start the printoutput activity.
          const result = getLastActivityResult(decisionTask.events);
          await schedulePrintOutputActivity(decisionTaskToken, result);
          break;

        case SWF_PRINTOUTPUT_ACTIVITY:
          // printoutput activity completed; complete the workflow.
          await completeWorkflow(decisionTaskToken);
          break;

        default:
          throw new Error(`Unexpected activity type: ${lastTask}.`);
      }
    }
  }
}

run();
