export const getJobId = (campaignId, flowItemId, prospectId) =>
	`${campaignId}-${flowItemId}-${prospectId}`;
export const getJobIdObj = (jobId) => {
	const [campaignId, flowItemId, prospectId] = jobId.split('-');
	return {
		campaignId,
		flowItemId,
		prospectId,
	};
};
