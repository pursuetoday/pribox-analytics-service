import MyQueue from "../../queue/myQueue";

import analyticExecutionJob from "../jobs/analyticExecution"

export const campaignAnalyticExecutionTitle = "campaign-analytic-queue";

export const campaignAnalyticExecutionQueue = new MyQueue(
	campaignAnalyticExecutionTitle
).process(analyticExecutionJob);



