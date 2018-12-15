# aws-swf-sample

## Overview

A sample for using AWS Simple Workflow Service (SWF). This sample uses SWF to
execute a command on a remote machine. You can still run it on your local
machine, though it is cooler to run it on multiple machines.

SWF is a powerful AWS service to enable the coordination of workflows execution,
regardless of where the execution of the different activities of the workflows
happen. For example, in a shopping application when the customer places an
order there are multiple steps, e.g. place order, charge credit card, dispatch
product, etc. that need to take place until the order is complete. Those steps
need not be executed on the same machine, and so SWF can come really handy.

Notice that SWF itself doesn't execute any code; it simply is a coordination
service. The different activities making up your workflow will have to
coordinate with SWF.

# Initial Configuration

## Create config.ts

Before you can run this sample, you need to create a file called `config.ts` in
the root directory. You should use the template in
[config.template.ts](config.template.ts) but set the credentials for your account
and the AWS region you want the sample to work in. You also need to choose a name for your S3 bucket. Needless to say, you should
NOT commit the `config.ts` file as it now contains your credentials.

## register-domain.ts

SWF requires that you create a domain for your workflows. This is mainly an
organizational mechanism to separate the workflows of different purposes. As
such, before you can run this sample, you have to register the domain that
is used in this sample with SWF; you only need to do this once. To register
the domain, execute the following:

```
npm run register-domain
```

If this succeeds, you should get the following message:

```
Domain 'remotejob' was registered successfully.
```

## register-types.ts

The next step after creating the domain is to create the necessary workflow
and activity types. In SWF, workflow and activity types don't contain any
code to be executed; they are morely orchestration entities and the user
needs to implement the code for them. So, we need to create our workflow
and activity types so we can reference them in the other components of
this sample. To do this, execute the following:

```
npm run register-types
```

If this succeeds, you should get the following message:

```
Registering worfklow 'workflow'.
Registering activity 'runcommand-activity'.
Registering activity 'printoutput-activity'.
Necessary SWF types were registered successfully.
```

## create-s3-bucket.ts

This sample uses S3 to upload the output of the remote command, to be later
printed by a different activity. As such, a bucket need to be created where
files will be stored. To create the bcket, execute the following command:

```
npm run create-s3-bucket
```

If this succeeds, you should ge tthe following message:

```
S3 bucket aws-swf-sample-runcommand-output-us-east-1 created successfully.
```

# Running

This sample consists of multiple components that need to be run simulatenously:

## Workflow Decider

In SWF, a central unit is required to control the execution of the workflow.
This unit is called the decider. It is pinged by SWF to inform SWF what it
should do. For example, for a simple workflow like
Activity A -> Activity B -> Activity C, SWF initially contact the decider
and the decider responds with a decision to run activity A. SWF then does that
and activity A is started. After the latter finishes, it informs SWF that
it finished and so SWF goes back to the decider again, which will start the
execution of activity B, and so on. In this sample, the decider is implemented
in the [workflow-decider.ts](workflow-decider.ts) file.

To execute the decider, run the following command:

```
npm run workflow-decider
```

This will start the decider, which polls SWF for decision tasks and process
them.

## Activities

This sample has two activities:

- **runcommand-activity**: This executes a simple command and return the result to the workflow.
- **printoutput-activity**: This prints an output to the console, which for the workflow in this sample is going to be the output of the `runcommand-activity` command.

To run those activities, open a new console for each activity and execute the following
commands in each console:

```
npm run runcommand-activity
```

```
npm run printoutput-activity
```

Like the decider, the activities poll SWF for activity tasks and process them.

## Starting a Workflow

Now that you have the decider and activities running and listening, you can start a workflow
by typing the following command in (yet) another console:

```
npm run start-workflow
```

You should get an output like:

```
Starting a new workflow.
Workflow started. Workflow ID: 59226587-3041-4fd2-9d6d-9802c527ff20. Run ID: 22iSy4AdItXjJLAnD07cz/jh/DYlpZKZUTdyAKM952i/U=
```

After that, move to the console where you have the decider working. It should
start scheduling tasks and you should see an output like:

```
Received a decision task:  {"taskToken": ...}
Scedule 'runcommand-activity' activity.
Received a decision task:  {"taskToken": ...}
Scedule 'printoutput-activity' activity.
Received a decision task:  {"taskToken": ...}
Complete workflow.
```

The activities consoles should also start receiving tasks and processing them.

I hope this sample was useful!
