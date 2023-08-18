import log from '../../utils/log';
import analyticExecutioner from '../analyticSchedule/analyticExecution';
// import moment from "moment";

async function processAnalyticExecution(campaign) {
	try {
		log('campaign analytic Execution Job starts', {
			campaignName: campaign?.name,
			debug: true,
		});

		await analyticExecutioner(campaign);

		return { res: true };
	} catch (err) {
		const errMessage = err?.message || err;
		log(`Campaign Analytic Execution  Process: Error ${errMessage}`, {
			campaignId: campaign._id,
			campaignName: campaign?.name,
			error: true,
			debug: true,
			er: err,
		});
		return { err: errMessage };
	}
}

async function analyticExecutionJob(job, done) {
	const { data: campaign } = job;

	try {
		const { err } = await processAnalyticExecution(campaign, done);
		if (err) return done(true, job);
		return done(null, job);
	} catch (err) {
		const campaignId = campaign?._id;
		const campaignName = campaign?.name;

		log(`Campaign Analytic Execution Job: Exception ${err?.message || err} [id: ${campaignName}]`, {
			campaignId,
			campaignName,
			error: true,
			debug: true,
			er: err,
		});
		return done(true, job);
	}
}

export default analyticExecutionJob;
