import dotenv from 'dotenv';
import { shortenedEnvs } from '../constant';

export const isProd = process.env.NODE_ENV === 'production';
export const isStaging = process.env.NODE_ENV === 'staging';
export const isDevLive = process.env.NODE_ENV === 'development';
export const local = process.env.NODE_ENV === 'dev-local';

dotenv.config(
	(!isProd || !isDevLive || !local) && { path: `.env.${shortenedEnvs[process.env.NODE_ENV]}` }
);

export const port = process.env.PORT || 5003;
export const env = process.env.NODE_ENV || 'development';

export const databaseConfig = process.env.DB_URL || 'mongodb://localhost/pribox';

export const REDIS_CONFIG = {
	host: process.env.REDIS_HOST || 'localhost',
	port: process.env.REDIS_PORT || 6379,
	password: process.env.REDIS_PASSWORD,
	connectTimeout: 10000,
	retry_strategy: (optionsParams) =>
		// reconnect after
		Math.max(optionsParams.attempt * 100, 3000),
};

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'l2dfc4UegqLIRpthgToHJvX2MQL3bkLR';

export const PRIBOX_WEB_APP_URI = {
	development: 'http://localhost:5002',
	staging: 'https://app-staging.pribox.io',
	production: 'https://app.pribox.io',
	undefined: 'https://app.pribox.io',
};

export const PRIBOX_CAMPAIGN_SIMULATOR_URI = {
	development: 'http://localhost:5002',
	staging: 'https://app-staging.pribox.io', // url should be change
	production: 'https://app.pribox.io',
	undefined: 'https://app.pribox.io',
};

const REDIRECT_URI = PRIBOX_WEB_APP_URI[process.env.NODE_ENV];

export const OUTLOOK_CREDS = {
	authority: 'https://login.microsoftonline.com/common',
	client_id: '7d50914c-8f24-486b-bd61-f3ca9e7ac0e1',
	client_secret: 'Gqq7Q~kexnJe8eHlM8RutKaEa7HnTMxioQU18',
	scopes: [
		'openid',
		'offline_access',
		'https://graph.microsoft.com/User.Read',
		'https://graph.microsoft.com/Mail.ReadWrite',
		'https://graph.microsoft.com/Mail.Send',
	],
	redirect_uri: REDIRECT_URI,
};

export const SENTRY_DNS =
	process.env.SENTRY_DNS ||
	'https://2f4702e16d7b4fc18d37e295fc2edb6d@o4505550487879680.ingest.sentry.io/4505589630763008';

export const SENTRY_ENV = process.env.NODE_ENV;

export const SLACK_SERVICE_URL =
	process.env.SLACK_SERVICE_URL ||
	'https://hooks.slack.com/services/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';
