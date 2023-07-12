import slack from "./slack";
import * as Sentry from "@sentry/node";

function log(message, params = {}) {
	let transaction;
	if (params.error) {
		transaction = Sentry.startTransaction({
			op: "log file",
			name: "capture error in log file for whole application",
		});
	}
	try {
		const { debug, error, er, ...restParams } = params || {};

		const consoleLog = error ? console.error : console.log;
		const data = JSON.stringify(restParams);
		consoleLog(message, data);

		if (debug && process.env.NODE_ENV !== "pre-dev") {
			const variant = error ? "error" : "none";
			slack(message, data, variant);
		}
		if (error) {
			Sentry.captureException(er);
			transaction.finish();
		}
	} catch (error) {
		Sentry.captureException(err);
		console.log("Error in log fn:", err);
	} finally {
		transaction.finish();
	}
}

export default log;
