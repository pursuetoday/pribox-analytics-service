// import { PageIterator } from '@microsoft/microsoft-graph-client';
import { parseOutlookMessage } from '../../utils/parseEmail';
import { getApiClient as getOutlookApiClient } from '../../core/outlookOAuth';
import Campaign from '../campaign';
import Imap from '../../core/imap';
import { msInHour } from '../../constant/timeConstant';
import log from '../../utils/log';
import { getCacheData, setCacheData } from '../../utils/nodeCache';

async function updateCampaignAnalytic(id, receivedReplies = 0, emailsBounced = 0) {
	await Campaign.updateCampaignAnalytic({ _id: id }, { receivedReplies, emailsBounced });
}

async function outlookReplies(campaignAnalytics, sender, campaign) {
	log(
		`sender: ${sender.email} , senderProvider: ${sender.provider} , campaign Name: ${campaign.name} , campaignId: ${campaign._id}`,
		{ debug: true }
	);
	if (sender.provider !== 'outlook') return;
	// const internetMessageId = messageId;
	const folder = 'Inbox';
	const client = getOutlookApiClient(sender._id);
	for (const campaignAnalytic of campaignAnalytics) {
		const { messageId } = campaignAnalytic;
		const { receivedReplies, emailsBounced } = campaignAnalytic;
		if (!receivedReplies && !emailsBounced) {
			// const data = [];
			// console.log("////" , folder , messageId);
			const response = await client
				.api(`/me/mailFolders('${folder}')/messages`)
				.filter(`createdDateTime gt ${new Date(Date.now() - 25 * msInHour).toISOString()}`)
				.orderby('createdDateTime')
				.top(1000)
				.select(
					'id,toRecipients,from,subject,internetMessageId,internetMessageHeaders,body,replyTo,isDeliveryReceiptRequested,isReadReceiptRequested,createdDateTime'
				)
				.get();

			// console.log("response-------", response.value.length);
			if (response) {
				const emails = response.value;
				for (const email of emails) {
					const message = parseOutlookMessage(email, folder);
					log(`"messageId--------", ${message?.inReplyTo} , ${message.from.email}, ${messageId}`, {
						debug: true,
					});

					if (message?.inReplyTo === messageId) {
						// console.log("message---match", message, message.inReplyTo, messageId);
						const undeliverable = message.subject.split(':')[0];
						log(
							`"undeliverable--------", ${undeliverable} message.inReplyTo: ${message.inReplyTo}`,
							{
								debug: true,
							}
						);
						if (undeliverable === 'Undeliverable') {
							console.log('emailsBounced found');
							if (!emailsBounced) await updateCampaignAnalytic(campaignAnalytic._id, 0, 1);
						} else {
							console.log('reply found');
							if (!receivedReplies) await updateCampaignAnalytic(campaignAnalytic._id, 1, 0);
						}
					}
				}
			}
		}
	}
}
async function imapConnection(sender) {
	try {
		const imap = await Imap.connect({ mailbox: sender });
		imap.connection.on('error', (e) => {
			console.log('connection error', e);
		});
		const inboxFolder = await imap.getInboxFolder();
		console.log('inboxFolder----', inboxFolder);
		await imap.openFolder(inboxFolder.path);
		return imap;
	} catch (e) {
		console.log('connection error', e);
	}
}
async function imapReplies(campaignAnalytics, sender, campaign) {
	const imap = await imapConnection(sender).catch((err) => {
		log(
			`Imap Error: sender ${sender.email} , provider: ${sender.provider} campaing: ${
				campaign.name
			} , Error: ${err.message || err}`,
			{
				debug: true,
				error: true,
				er: err,
			}
		);
	});

	for (const campaignAnalytic of campaignAnalytics) {
		const { messageId } = campaignAnalytic;
		const { receivedReplies, emailsBounced } = campaignAnalytic;
		if (!receivedReplies && !emailsBounced) {
			if (!imap) {
				log(`imap is null for sender: ${sender.email}`, {
					debug: true,
				});
				return;
			}
			const fetchOptions = {
				bodies: ['HEADER'],
			};
			const inboxEmails = await imap.search([['HEADER', 'In-Reply-To', messageId]], fetchOptions);

			log(`imap or google reply ---inboxEmails: ${inboxEmails}`, {
				debug: true,
				flags: (inboxEmails && inboxEmails[0]?.attributes.flags) || '',
				failedRecipient:
					(inboxEmails && inboxEmails[0]?.parts[0].body['x-failed-recipients']) || '',
				sender: sender.email,
				messageId,
			});
			if (inboxEmails && inboxEmails[0]?.parts[0].body['x-failed-recipients']?.length > 0) {
				if (!emailsBounced) await updateCampaignAnalytic(campaignAnalytic._id, 0, 1);
			} else if (inboxEmails.length) {
				console.log('inboxEmails.length', inboxEmails.length);
				if (!receivedReplies) await updateCampaignAnalytic(campaignAnalytic._id, 1, 0);
			}
		}
	}

	await imap.closeImap();
	imap.endImap();
}
async function processAnalyticExecutioner(senderObj) {
	const { sender, campaigns } = senderObj;
	if (!sender || campaigns?.length < 1) throw new Error('sender or campaign list not available');

	log(
		`campaign analytic start Execution for campaign length ${campaigns?.length} , sender email: ${sender.email}`,
		{ debug: true }
	);

	const currentCampaignIndex = getCacheData(String(sender?._id)) || 0;
	let campaign;
	if (campaigns?.length === 1) {
		campaign = campaigns[0];
	} else {
		campaign = campaigns[currentCampaignIndex];
		setCacheData(String(sender._id), (currentCampaignIndex + 1) % campaigns.length, 18000);
	}

	if (!campaign) return;

	const query = { campaignId: campaign._id, senderId: sender._id };

	const campaignAnalytics = await Campaign.getCampaignAnalytic(query);
	if (!campaignAnalytics?.length) return;

	// console.log(
	// 	'campaignAnalytics-------------------',
	// 	currentCampaignIndex,
	// 	campaign.name,
	// 	sender.email,
	// 	campaignAnalytics.length,
	// 	campaignAnalytics[0]
	// );
	try {
		if (sender.provider === 'outlook') {
			await outlookReplies(campaignAnalytics, sender, campaign);
		} else {
			await imapReplies(campaignAnalytics, sender, campaign);
		}
	} catch (err) {
		log(`processAnalyticExecutioner Error: ${err?.message || err} sender: ${sender.email} `, {
			error: true,
			debug: true,
			er: err,
		});
	}
}

async function analyticExecutioner(senderObj) {
	try {
		log('execution start------------');

		await processAnalyticExecutioner(senderObj);
	} catch (err) {
		log(`Campaign analytics execution Error: ${err?.message || err} `, {
			error: true,
			debug: true,
			er: err,
		});
	}
}

export default analyticExecutioner;
