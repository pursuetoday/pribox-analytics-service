import { parseOutlookMessage } from "../../utils/parseEmail";
import { getApiClient as getOutlookApiClient } from "../../core/outlookOAuth";
import { Campaign } from "../campaign";
import Imap from "../../core/imap";

export class AnalyticExecution {
	campaign = {};
	analyticScheduler;
	senders = [];
	sender = {};
	campaignAnalytics = [];
	imap;

	constructor(campaign, analyticScheduler) {
		this.campaign = campaign;
		this.analyticScheduler = analyticScheduler;
	}

	async init() {
		console.log(
			`campaign analytic Execution init for campaign ${this.campaign.name}`
		);
		this.senders = await Campaign.getSenders([this.campaign.sender]);
		this.campaignAnalytics = await Campaign.getCampaignAnalytic({
			campaignId: this.campaign._id,
		});
	}
	async startExecution() {
		console.log(
			`campaign analytic Execution startExecution for campaign ${this.campaign.name}`
		);

		for (const sender of this.senders) {
			this.sender = sender;
			// console.log(
			// 	"this.campaignAnalytics-------1",
			// 	this.campaignAnalytics,
			// 	this.sender._id
			// );
			const filterCampaignAnalytics = this.campaignAnalytics.filter(
				(v) => String(v.senderId) === String(this.sender._id)
			);
			// console.log("filterCampaignAnalytics------", filterCampaignAnalytics);
			if (filterCampaignAnalytics) {
				if (this.sender.provider !== "outlook") {
					this.imap = await this.imapConnection;
				}
				for (const campaignAnalytic of filterCampaignAnalytics) {
					const messageId = campaignAnalytic.messageId;
					let receivedReplies = campaignAnalytic.receivedReplies;
					// console.log("receivedReplies----", receivedReplies);
					if (!receivedReplies) {
						if (await this.emailReplies(messageId)) {
							receivedReplies++;
						}
						await Campaign.updateCampaignAnalytic(
							{ _id: campaignAnalytic._id },
							{ receivedReplies }
						);
					}
				}
				await this.closeImap();
			}
		}
	}

	get imapConnection() {
		return new Promise(async (resolve, reject) => {
			try {
				let imap = await Imap.connect({ mailbox: this.sender });
				imap.connection.on("error", function (e) {
					console.log("connection error", e);
				});
				const inboxFolder = await imap.getInboxFolder();
				await imap.openFolder(inboxFolder.path);
				resolve(imap);
			} catch (e) {
				console.log("connection error", e);
			}
		});
	}
	async closeImap() {
		if (this.sender.provider !== "outlook") {
			await this.imap.closeImap();
			this.imap.endImap();
		}
	}

	async emailReplies(messageId) {
		// console.log("this.#sender.provider-----------------------", this.#sender);
		if (this.sender.provider === "outlook") {
			const folder = "Inbox";
			const client = getOutlookApiClient(this.sender._id);
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
			console.log("folder-----------", folder, findMessageId);
			if (findMessageId) {
				return true;
			} else {
				return false;
			}
		} else {
			const inboxEmails = await this.imap.search([
				["HEADER", "In-Reply-To", messageId],
			]);
			console.log(
				"inboxEmails  reply-----",
				inboxEmails,
				messageId
			);
			if (inboxEmails.length) {
				console.log("/true");
				return true;
			} else {
				console.log("/false");
				return false;
			}
		}
	}
}
