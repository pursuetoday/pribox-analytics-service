import Campaign from "../campaign";
import {
	campaignAnalyticExecutionQueue,
	campaignAnalyticExecutionTitle,
} from "../queues";
import { generateJobId } from "../../utils/jobId";
import log from "../../utils/log";
import moment from "moment";

async function processAnalyticScheduler() {
	const query = {
		status: "active",
		deletedAt: null,
		// createdAt: {
		// 	// 35 minutes ago (from now)
		// 	$gt: new Date(Date.now() - 1000 * 60 - 1000 * 60 * 35),
		// },
	};

	const campaigns = await Campaign.getCampaigns(query, { createdAt: -1 });

	log(`campaign analytic scheduler init campaignsLength ${campaigns?.length}`);

	for (const campaign of campaigns) {
		const analyticEndDate = moment(campaign?.duration?.endingAt).add(
			25,
			"days"
		);

		if (moment().isBefore(analyticEndDate)) {
			const jobId = generateJobId(campaignAnalyticExecutionTitle, campaign._id);
			const currentJob = await campaignAnalyticExecutionQueue.getJob(jobId);
			if (!currentJob) {
				campaignAnalyticExecutionQueue.add(
					campaignAnalyticExecutionTitle,
					campaign,
					{
						// delay: 5000,
						jobId,
					}
				);
			}
		}
	}
}

async function analyticScheduler() {
	try {
		await processAnalyticScheduler();
	} catch (err) {
		log(`Campaign Email scheduler Error: ${err?.message || err} `, {
			error: true,
			debug: true,
		});
	}
}

export default analyticScheduler;
