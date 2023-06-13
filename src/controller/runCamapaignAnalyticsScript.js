import { campaignAnalyticTestScript } from "../services/campaignAnalyticTestScript.js";
import log from "../utils/log.js";

export const runCampaignScript = async (req, res, next) => {
	const { campaignId, sender } = req.query;
	try {
		log(`campaignId: ${campaignId}`, `sender: ${sender}`, { debug: true });

		const campaign = await campaignAnalyticTestScript(campaignId, sender);

		// const prospects = await getProspects(campaign);
		// console.log({ prospects });
	} catch (error) {
		console.log(error, "Failed to execute mailbox sync on email sent", "error");
		console.error(error);
	}
	next();
};
