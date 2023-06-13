import { campaignAnalyticTestScript } from "../services/campaignAnalyticTestScript.js";

export const runCampaignScript = async (req, res, next) => {
	const { campaignId, sender } = req.query;
	try {
		console.log(`campaignId: ${campaignId}`, `sender: ${sender}`);
		const campaign = await campaignAnalyticTestScript(campaignId, sender);

		// const prospects = await getProspects(campaign);
		// console.log({ prospects });
	} catch (error) {
		console.log(error, "Failed to execute mailbox sync on email sent", "error");
		console.error(error);
	}
	next();
};
