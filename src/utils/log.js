function log(message, params = {}) {
	const { debug, error, ...restParams } = params || {};

	const consoleLog = error ? console.error : console.log;
	const data = JSON.stringify(restParams);
	consoleLog(message, data);

	if (debug && process.env.NODE_ENV !== "pre-dev") {
		const variant = error ? "error" : "none";
		slack(message, data, variant);
	}
}

export default log;
