import { AnalyticExecution } from "../analyticExecution/analyticExecution";
import { Campaign } from "../campaign";

class AnalyticScheduler {
	campaigns = [];

	constructor() {
		// console.clear();
	}
	async init() {
		console.log("campaign analytic scheduler init");

		this.campaigns = await Campaign.getCampaigns(
			{ status: { $nin: ["ready", "draft"] }, deletedAt: null },
			{ createdAt: -1 }
		);
	}
	async start() {
		console.log(
			`campaign analytic scheduler start and campaign lenght: ${this.campaigns.length}`
		);
		for (const campaign of this.campaigns) {
			const analyticExec = new AnalyticExecution(campaign, this);
			await analyticExec.init();
			await analyticExec.startExecution();
		}
	}
}

export default async () => {
	try {
		const obj = new AnalyticScheduler();
		await obj.init();
		await obj.start();
	} catch (error) {
		console.log("error---", error);
	}
};
