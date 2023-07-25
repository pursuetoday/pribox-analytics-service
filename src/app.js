import express from 'express';
import * as Sentry from '@sentry/node';
import jobScheduler from './campaignAnalytics/jobScheduler';
import connectDatabase from './connections/database';
import { SENTRY_ENV, SENTRY_DNS } from './config';

const app = express();

Sentry.init({
	dsn: SENTRY_DNS,
	environment: SENTRY_ENV,
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Sentry.Integrations.Express({ app }),
		// Automatically instrument Node.js libraries and frameworks
		...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
	],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});

app.use(express.json());

app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(Sentry.Handlers.errorHandler());

(async () => {
	try {
		const info = await connectDatabase();
		console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
	} catch (error) {
		console.error(`Connection error: ${error}. Unable to connect to database`);
		process.exit(1);
	}
})();

try {
	jobScheduler();
	console.log('job-----');
	// campaignStepScheduler()
} catch (e) {
	console.log(e.message);
}

export default app;
