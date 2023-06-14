import { campaignAnalyticTestScript } from "../services/campaignAnalyticTestScript.js";
import log from "../utils/log.js";

export const runCampaignScript = async (req, res, next) => {
	const { campaignId, sender } = req.query;
	try {
		log(`campaignId: ${campaignId} sender: ${sender}`, { debug: true });

		const camp = await campaignAnalyticTestScript(campaignId, sender);
		if (camp) res.status(200).send({ linkClick: true });
	} catch (error) {
		log("Failed to runCampaignScript Error:", {
			debug: true,
			error,
		});
		console.error(error);
	}
	next();
};
