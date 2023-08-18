export const generateJobId = (queueTitle, campaignId) => `${queueTitle}-${campaignId}`;
export const getJobIdObj = (jobId) => {
	const [queueTitle, campaignId] = jobId.split('-');
	return {
		queueTitle,
		campaignId,
	};
};
