export const getJobId = (campaignId, flowItemId, prospectId) => {
	return `${campaignId}-${flowItemId}-${prospectId}`;
};
export const getJobIdObj = (jobId) => {
	const [campaignId, flowItemId, prospectId] = jobId.split("-");
	return {
		campaignId,
		flowItemId,
		prospectId,
	};
};
