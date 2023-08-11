// import moment from 'moment';
import { map } from 'lodash';
import Campaign from '../campaign';
// import { campaignAnalyticExecutionQueue, campaignAnalyticExecutionTitle } from '../queues';
// import { generateJobId } from '../../utils/jobId';
import log from '../../utils/log';
import promiseLimit from 'promise-limit';
import analyticExecutioner from './analyticExecution';

const pLimit = promiseLimit(10);

async function processAnalyticScheduler() {
	const query = {
		status: { $nin: ['ready', 'draft'] },
		deletedAt: null,
		// createdAt: {
		// 	// 35 minutes ago (from now)
		// 	$gt: new Date(Date.now() - 1000 * 60 - 1000 * 60 * 35),
		// },
	};

	const campaigns = await Campaign.getCampaigns(query, { createdAt: -1 });

	log(`campaign analytic scheduler init campaignsLength ${campaigns?.length}`, { debug: true });

	await Promise.all(map(campaigns, (campaign) => pLimit(() => analyticExecutioner(campaign))));

	// campaigns.forEach(async (campaign, i) => {
	// 	const analyticEndDate = moment(campaign?.duration?.endingAt).add(5, 'days');

	// 	if (moment().isBefore(analyticEndDate)) {
	// 		const jobId = generateJobId(campaignAnalyticExecutionTitle, campaign._id);
	// 		const currentJob = await campaignAnalyticExecutionQueue.getJob(jobId);
	// 		if (!currentJob) {
	// 			campaignAnalyticExecutionQueue.add(campaignAnalyticExecutionTitle, campaign, {
	// 				delay: 300 * i,
	// 				jobId,
	// 			});
	// 		}
	// 	}
	// });
}

async function analyticScheduler() {
	try {
		await processAnalyticScheduler();
	} catch (err) {
		log(`Campaign Analytics scheduler Error: ${err?.message || err} `, {
			error: true,
			debug: true,
			er: err,
		});
	}
}

export default analyticScheduler;
