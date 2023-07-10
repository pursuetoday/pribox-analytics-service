import { campaignAnalyticTestScript } from "../services/campaignAnalyticTestScript.js";
import log from "../utils/log.js";

export const runCampaignScript = async (req, res, next) => {
	const { campaignId, sender, open, click } = req.query;
	try {
		log(`campaignId: ${campaignId} sender: ${sender}, open: ${open}, click: ${click}`, { debug: true });

		const camp = await campaignAnalyticTestScript(
			campaignId,
			sender,
			open,
			click
		);
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
