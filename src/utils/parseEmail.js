import { simpleParser } from 'mailparser';
import log from './log';

const parserOptions = {
	skipHtmlToText: true,
	skipImageLinks: true,
	skipTextToHtml: true,
};

export async function parseEmail(email, label) {
	const source = `Imap-Id: ${email.attributes.uid}\r\n${
		email.parts.find((part) => part.which === '')?.body
	}`;

	const parsedEmail = await simpleParser(source, parserOptions);
	const { to, from, subject, messageId, inReplyTo, date, html, text } = parsedEmail;

	return {
		to:
			to?.value &&
			to.value.map((obj) => ({
				email: obj.address,
				...(obj.name && { name: obj.name }),
			})),
		from:
			from?.value &&
			from.value.map((obj) => ({
				email: obj.address,
				...(obj.name && { name: obj.name }),
			}))[0],
		subject,
		messageId,
		inReplyTo,
		body: html || text,
		labels: [label],
		tags: email.attributes.flags.map((item) =>
			item.replace('\\', '').replace('$', '').toLowerCase()
		),
		isSpam: ['spam', 'junk', 'bulk mail'].includes(label.toLowerCase()),
		date,
	};
}

export function parseOutlookMessage(email, folder) {
	if (!email) return;
	try {
		const inReplyToHeader =
			email.internetMessageHeaders &&
			email.internetMessageHeaders.find((header) => header.name === 'In-Reply-To');

		const message = {
			id: email.id,
			to: email.toRecipients.map((recipient) => ({
				name: recipient.emailAddress.name,
				email: recipient.emailAddress.address,
			}))[0],
			from: {
				name: email.from.emailAddress.name,
				email: email.from.emailAddress.address,
			},
			subject: email.subject,
			messageId: email.internetMessageId,
			...(inReplyToHeader && { inReplyTo: inReplyToHeader.value }),
			body: email.body.content,
			date: email.createdDateTime,
			labels: [folder.toLowerCase()],
			isSpam: folder === 'Junk Email',
		};

		return message;
	} catch (err) {
		log(`Error parseOutlookMessage: ${err.message || err}`, {
			debug: true,
			error: true,
		});
	}
}
