import express from "express";
import jobScheduler from "./campaignAnalytics/jobScheduler";
import connectDatabase from "./connections/database";

const app = express();
app.use(express.json());

(async () => {
	try {
		const info = await connectDatabase();
		console.log(
			`Connected to ${info.host}:${info.port}/${info.name}`
		);
	} catch (error) {
		console.error(`Connection error: ${error}. Unable to connect to database`);
		process.exit(1);
	}
})();

try {
	jobScheduler();
	console.log("job-----");
	// campaignStepScheduler()
} catch (e) {
	console.log(e.message);
}

export default app;
