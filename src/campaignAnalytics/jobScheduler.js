import cron from 'node-cron';
import analyticScheduler from './analyticSchedule/analyticScheduler';

export default function jobScheduler() {
	try {
		// cron.schedule("*/1 * * * *", campaignStepScheduler); // every 1 min
		// cron.schedule('*/15 * * * * *', testFunc); // every 1 min
		cron.schedule('*/7 * * * *', analyticScheduler); // every 1 min
	} catch (e) {
		console.log('Error scheduling jobs', e);
	}
}

// const testFunc = async () => {
// 	console.log('test function-----');
// };
