import { map } from 'lodash';
import promiseLimit from 'promise-limit';
import Campaign from '../campaign';
import log from '../../utils/log';
import analyticExecutioner from './analyticExecution';

const pLimit = promiseLimit(10);

async function processAnalyticScheduler() {
	const senders = await Campaign.getSendersByCampaignsGroup();

	log(`campaign analytic scheduler init senders length ${senders?.length}`, { debug: true });

	await Promise.all(map(senders, (sender) => pLimit(() => analyticExecutioner(sender))));
}

async function analyticScheduler() {
	try {
		await processAnalyticScheduler();
	} catch (err) {
		log(`Campaign Analytics scheduler Error: ${err?.message || err} `, {
			error: true,
			debug: true,
			er: err,
		});
	}
}

export default analyticScheduler;
