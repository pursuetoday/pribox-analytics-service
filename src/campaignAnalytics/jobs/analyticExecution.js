import log from "../../utils/log";
import Campaign from "../campaign";
import analyticExecutioner from "../analyticSchedule/analyticExecution";
import { generateJobId } from "../../utils/jobId";

async function processAnalyticExecution(campaign, done) {
	try {
		if (campaign.status !== "draft" || "ready") {
			log("campaign analytic Execution Job starts", {
				campaignName: campaign?.name,
			});
			await analyticExecutioner(campaign);
			const analyticEndDate = moment(campaign?.duration?.endingAt).add(
				25,
				"days"
			);
			if (analyticEndDate.isAfter()) {
				await done(null, job);
			} else {
				await done(null, job);
				// const jobId = generateJobId(queueTitle, campaign._id);
				// queue.add(queueTitle, campaign, {
				// 	delay: 3000,
				// 	jobId,
				// });
			}
		} else {
			await done(null, job);
			// const jobId = generateJobId(queueTitle, campaign._id);
			// queue.add(queueTitle, campaign, {
			// 	delay: 3000,
			// 	jobId,
			// });
		}

		return { res: true };
	} catch (err) {
		const errMessage = err?.message || err;
		log(
			`Campaign Email Step Process: Error ${errMessage} [id: ${nodeItem._id}]`,
			{
				campaignId: campaign._id,
				nodeItemId: nodeItem._id,
				error: true,
				debug: true,
			}
		);
		return { err: errMessage };
	}
}

async function analyticExecutionJob(job, done) {
	const { data: campaign } = job;

	try {
		const { err } = await processAnalyticExecution(campaign, done);
		if (err) return done(true, job);
		return done(null , job)
	} catch (err) {
		const campaignId = campaign?._id;
		const campaignName = campaign?.name;

		log(
			`Campaign Analytic Execution Job: Exception ${
				err?.message || err
			} [id: ${campaignName}]`,
			{ campaignId, campaignName, error: true }
		);
		return done(true, job);
	}
}

export default analyticExecutionJob;
