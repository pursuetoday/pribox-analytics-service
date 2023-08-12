// import { PageIterator } from '@microsoft/microsoft-graph-client';
import { parseOutlookMessage } from '../../utils/parseEmail';
import { getApiClient as getOutlookApiClient } from '../../core/outlookOAuth';
import Campaign from '../campaign';
import Imap from '../../core/imap';
import { msInHour } from '../../constant/timeConstant';
import log from '../../utils/log';
import moment from 'moment';

async function processAnalyticExecutioner(campaign) {
	const senders = await Campaign.getSenders(campaign.sender);
	const campaignAnalytics = await Campaign.getCampaignAnalytic({
		campaignId: campaign._id,
	});

	if (!senders || !campaignAnalytics) {
		return;
	}

	log(
		`campaign analytic start Execution for campaign ${campaign.name} , sendersLength: ${senders}`,
		{ debug: true }
	);

	for (const sender of senders) {
		// console.log(
		// 	"this.campaignAnalytics-------1",
		// 	this.campaignAnalytics,
		// 	this.sender._id
		// );
		try {
			const filterCampaignAnalytics = campaignAnalytics.filter(
				(v) => String(v.senderId) === String(sender._id)
			);
			// console.log("filterCampaignAnalytics------", filterCampaignAnalytics);
			let imap;
			if (filterCampaignAnalytics) {
				if (sender.provider !== 'outlook') {
					imap = await imapConnection(sender).catch((err) => {
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
				}

				log(`filterCampaignAnalytics ${filterCampaignAnalytics.length}`, {
					debug: true,
				});
				for (const campaignAnalytic of filterCampaignAnalytics) {
					const { messageId } = campaignAnalytic;
					let { receivedReplies, emailsBounced } = campaignAnalytic;
					if (!receivedReplies && !emailsBounced) {
						if (sender.provider === 'outlook') {
							const { reply, bounceEmail } = await outlookReplies(
								messageId,
								sender,
								receivedReplies,
								emailsBounced
							);
							if (!receivedReplies && reply > 0) receivedReplies++;

							if (!emailsBounced && bounceEmail > 0) emailsBounced++;
						} else {
							if (!imap) {
								log(`imap is null for sender: ${sender.email}`, {
									debug: true,
								});
								return;
							}

							if (imap) {
								const fetchOptions = {
									bodies: ['HEADER'],
								};
								const inboxEmails = await imap.search(
									[['HEADER', 'In-Reply-To', messageId]],
									fetchOptions
								);

								log(`imap or google reply ---inboxEmails: ${inboxEmails}`, {
									debug: true,
									flags: inboxEmails && inboxEmails[0]?.attributes.flags || "",
									failedRecipient:
										inboxEmails && inboxEmails[0]?.parts[0].body['x-failed-recipients'] || "",
									sender: sender.email,
									messageId,
								});
								if (
									inboxEmails &&
									inboxEmails[0]?.parts[0].body['x-failed-recipients']?.length > 0
								) {
									if (!emailsBounced) emailsBounced++;
								} else if (inboxEmails.length) receivedReplies++;
							}
						}

						await Campaign.updateCampaignAnalytic(
							{ _id: campaignAnalytic._id },
							{ receivedReplies, emailsBounced }
						);
					}
				}
				if (imap && sender.provider !== 'outlook') {
					await imap.closeImap();
					imap.endImap();
				}
			}
		} catch (err) {
			log(
				`Sender Error: sender ${sender.email} , provider: ${sender.provider} campaing: ${
					campaign.name
				} , Error: ${err.message || err}`,
				{
					debug: true,
					error: true,
					er: err,
				}
			);
			continue;
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

async function outlookReplies(messageId, sender, reply, bounceEmail) {
	// console.log(
	// 	"sender.provider-----------------------",
	// 	sender.provider,
	// 	messageId
	// );
	if (sender.provider === 'outlook') {
		const internetMessageId = messageId;
		const folder = 'Inbox';
		const client = getOutlookApiClient(sender._id);
		const data = [];
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
					// console.log("message--------", message, message.inReplyTo, messageId);
					const undeliverable = message.subject.split(':')[0];
					log(`"undeliverable--------", ${undeliverable} message.inReplyTo: ${message.inReplyTo}`, {
						debug: true,
					});
					if (undeliverable === 'Undeliverable') {
						bounceEmail++;
					} else {
						reply++;
					}
				}
			}
		}

		return {
			reply,
			bounceEmail,
		};
	}
}

async function analyticExecutioner(campaign) {
	try {
		const analyticEndDate = moment(campaign?.duration?.endingAt).add(5, 'days');
		log('execution start------------');
		if (moment().isBefore(analyticEndDate)) {
			await processAnalyticExecutioner(campaign);
		}
	} catch (err) {
		log(`Campaign analytics execution Error: ${err?.message || err} `, {
			error: true,
			debug: true,
			er: err,
		});
	}
}

export default analyticExecutioner;
