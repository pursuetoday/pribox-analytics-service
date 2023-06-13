import { getApiClient as getOutlookApiClient } from "../core/outlookOAuth";
import Imap from "../core/imap";
import Campaign from "../campaignAnalytics/campaign";
import { JSDOM } from "jsdom";
import axios from "axios";
import { log } from "console";

export const campaignAnalyticTestScript = async (campaignId, sender) => {
	const campaign = await Campaign.getCampaign(campaignId);
	const prospects = await Campaign.getProspects(campaign);
	let emailProspect = [];
	prospects?.forEach((element) => {
		emailProspect.push(element.email);
	});

	const receivers = await Campaign.getSendersByEmails(emailProspect);

	for (const receiver of receivers) {
		if (receiver?.provider === "outlook") {
			await interactViaOutlook(receiver._id, sender);
		} else {
			await interactViaIMAP(receiver, sender);
		}
	}
};
async function interactViaIMAP(receiver, sender) {
	const fetchOptions = {
		bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
		markSeen: false,
	};

	const imap = await Imap.connect({ mailbox: receiver, fetchOptions });
	const inboxFolder = await imap.getInboxFolder();
	await imap.openFolder(inboxFolder.path);
	const inboxEmails = await imap.search([["UNSEEN"], ["SINCE", new Date()]]);

	inboxEmails.forEach(async (element, i) => {
		const { uid } = element.attributes;

		const messageBody = element?.parts;
		const from = messageBody[1]?.body?.from;
		const message = messageBody[0].body;

		const isSenderMatch = from.some((v) => {
			const s1 = v.split("<")[1];
			const s2 = s1.split(">")[0];
			return s2 === sender;
		});
		if (isSenderMatch) {
			const convertedString = message.replace(/=\r\n/g, "");
			const dom = new JSDOM(convertedString);
			const hrefValue = dom.window.document
				.querySelector("a")
				.getAttribute("href");
			const url = hrefValue.replace(/3D/g, "");
			await clickOnLink(url);
			await imap.markAsSeen(uid);
		}
	});
}

async function interactViaOutlook(toMailbox, sender) {
	const client = getOutlookApiClient(toMailbox);

	let messages = await client
		.api("/me/messages")
		.top(2)
		.select("sender,subject")
		.get();

	messages?.value.forEach(async (element) => {
		const msg = await client
			.api(`/me/messages/${element.id}`)
			.update({ isRead: true, importance: "High" });
	});
}
const clickOnLink = async (url) => {
	log(`Url for click:- ${url}`, {
		error,
		debug: true,
	});
	await axios
		.get(url)
		.then(function (response) {
			// handle success
			log(`Request res:-`, {
				response,
				debug: true,
			});
		})
		.catch(function (error) {
			// handle error
			log(`Request Error:-`, {
				error,
				debug: true,
			});
		});
};
