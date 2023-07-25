import { campaignAnalyticExecutionQueue } from '../campaignAnalytics/queues';

export const getAnalyticsRedisQueueCount = async (req, res, next) => {
	try {
		const jobCount = await campaignAnalyticExecutionQueue.getJobCounts();
		const jobData = await campaignAnalyticExecutionQueue.getJobs();
		res.status(200).send({ redisQueueCount: jobCount, jobData });
		next();
	} catch (error) {
		console.log(error);
	}
};
