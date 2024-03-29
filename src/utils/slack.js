import axios from 'axios';
import { serializeError } from './error';
import { shortenedEnvs } from '../constant';
import { SLACK_SERVICE_URL } from '../config';

function parseMessage(message) {
	if (typeof message === 'string') {
		return message;
	}
	if (message instanceof Error) {
		return serializeError(message);
	}
	if (typeof message === 'object') {
		return JSON.stringify(message, null, 4);
	}
	return message;
}

function getColorFromVariant(variant) {
	switch (variant) {
		case 'none':
			return '#5a29a7';
		case 'error':
			return '#FF4842';
		default:
			return '#439FE0';
	}
}
export default async function slack(message, pretext, variant = 'none', extra) {
	try {
		if (process.env.NODE_ENV === 'dev-local') {
			return console.log(
				`${pretext}: ${parseMessage(message)}
			${extra ? parseMessage(extra) : ''}`
			);
		}

		const slackMessageBody = {
			attachments: [
				{
					title: `Pribox.Analytic.Service [${shortenedEnvs[process.env.NODE_ENV]}] ${
						variant === 'error' ? 'ERROR' : ''
					}: ${pretext}`,
					text: `${parseMessage(message)}
					${extra ? parseMessage(extra) : ''}`,
					color: getColorFromVariant(variant),
				},
			],
		};
		await axios({
			method: 'POST',
			url: SLACK_SERVICE_URL,
			data: slackMessageBody,
			headers: { 'content-type': 'application/json' },
		});
	} catch (e) {
		console.log('slack error: ', e.message);
	}
}
