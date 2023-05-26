import { parseOutlookMessage } from "../../utils/parseEmail";
import { getApiClient as getOutlookApiClient } from "../../core/outlookOAuth";
import Campaign from "../campaign";
import Imap from "../../core/imap";
import { msInHour } from "../../constant/timeConstant";
import { PageIterator } from "@microsoft/microsoft-graph-client";
import log from "../../utils/log";

async function processAnalyticExecutioner(campaign) {
	const senders = await Campaign.getSenders(campaign.sender);
	const campaignAnalytics = await Campaign.getCampaignAnalytic({
		campaignId: campaign._id,
	});

	if (!senders || !campaignAnalytics) {
		return;
	}

	log(
		`campaign analytic Execution startExecution for campaign ${campaign.name}`
	);

	for (const sender of senders) {
		// console.log(
		// 	"this.campaignAnalytics-------1",
		// 	this.campaignAnalytics,
		// 	this.sender._id
		// );
		const filterCampaignAnalytics = campaignAnalytics.filter(
			(v) => String(v.senderId) === String(sender._id)
		);
		// console.log("filterCampaignAnalytics------", filterCampaignAnalytics);
		let imap;
		if (filterCampaignAnalytics) {
			if (sender.provider !== "outlook") {
				imap = await imapConnection(sender);
			}
			for (const campaignAnalytic of filterCampaignAnalytics) {
				const messageId = campaignAnalytic.messageId;
				let receivedReplies = campaignAnalytic.receivedReplies;
				// console.log("receivedReplies----", receivedReplies);
				if (!receivedReplies) {
					if (await emailReplies({ messageId, sender, imap })) {
						receivedReplies++;
					}
					if (receivedReplies > 0) {
						await Campaign.updateCampaignAnalytic(
							{ _id: campaignAnalytic._id },
							{ receivedReplies }
						);
					}
				}
			}
			await imap.closeImap();
			imap.endImap();
		}
	}
}

function imapConnection(sender) {
	return new Promise(async (resolve, reject) => {
		try {
			let imap = await Imap.connect({ mailbox: sender });
			imap.connection.on("error", function (e) {
				console.log("connection error", e);
			});
			const inboxFolder = await imap.getInboxFolder();
			console.log("inboxFolder----", inboxFolder);
			await imap.openFolder(inboxFolder.path);
			resolve(imap);
		} catch (e) {
			console.log("connection error", e);
		}
	});
}

async function emailReplies({ messageId, sender, imap }) {
	// console.log("this.#sender.provider-----------------------", this.#sender);
	if (sender.provider === "outlook") {
		const folder = "Inbox";
		const client = getOutlookApiClient(sender._id);
		let data = [];
		// console.log("////" , folder , messageId);
		const response = await client
			.api(`/me/mailFolders('${folder}')/messages`)
			.filter(
				`createdDateTime gt ${new Date(
					Date.now() - 25 * msInHour
				).toISOString()}`
			)
			.orderby("createdDateTime")
			.top(1000)
			.select(
				"toRecipients,from,subject,internetMessageId,internetMessageHeaders,body,createdDateTime"
			)
			.get();
		if (response) {
			let paginator = new PageIterator(client, response, (message) => {
				const email = parseOutlookMessage(message, folder);
				// console.log("email")
				data.push(email);
			});

			await paginator.iterate();
		}
		const findMessageId = data.some((v) => v.messageId === messageId);
		log(`folder----------- ${folder} ${findMessageId}`);
		if (findMessageId) {
			return true;
		} else {
			return false;
		}
	} else {
		const inboxEmails = await imap.search([
			["HEADER", "In-Reply-To", messageId],
		]);
		log(
			`inboxEmails  reply----- ${inboxEmails}
			${inboxEmails && inboxEmails[0]?.attributes.flags}
			${messageId}
			${sender.email}`
		);
		if (inboxEmails.length) {
			log("/true");
			return true;
		} else {
			log("/false");
			return false;
		}
	}
}

async function analyticExecutioner(campaign) {
	try {
		await processAnalyticExecutioner(campaign);
	} catch (err) {
		log(`Campaign Email execution Error: ${err?.message || err} `, {
			error: true,
			debug: true,
		});
	}
}

export default analyticExecutioner;
