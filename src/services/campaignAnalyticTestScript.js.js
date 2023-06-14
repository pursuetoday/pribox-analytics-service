import { getApiClient as getOutlookApiClient } from "../core/outlookOAuth";
import Imap from "../core/imap";
import Campaign from "../campaignAnalytics/campaign";
import { JSDOM } from "jsdom";
import axios from "axios";
import log from "../utils/log";
import moment from "moment";

export const campaignAnalyticTestScript = async (campaignId, sender) => {
	try {
		log(`campaignId with start ${campaignId}`, { debug: true });

		const campaign = await Campaign.getCampaign(campaignId);
		const prospects = await Campaign.getProspects(campaign);

		const emailProspect = prospects.map((e) => e.email);

		log(
			`emailProspect ${emailProspect} , campaign: ${campaign} , prospects: ${prospects}`,
			{ debug: true }
		);

		const receivers = await Campaign.getSendersByEmails(emailProspect);

		log(`receivers ${receivers}`, { debug: true });

		for (const receiver of receivers) {
			if (receiver?.provider === "outlook") {
				await interactViaOutlook(receiver._id, sender);
			} else {
				await interactViaIMAP(receiver, sender);
			}
		}
    return true
	} catch (error) {
		log(`Failed to campaignAnalyticTestScript Error: ${error}`, {
			debug: true,
			error,
		});
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
	log(`inboxEmails ${inboxEmails?.length}`, { debug: true });

	for (const element of inboxEmails) {
		const { uid } = element.attributes;

		const messageBody = element?.parts;
		const from = messageBody[1]?.body?.from;
		const message = messageBody[0].body;

		const isSenderMatch = from.some((v) => {
			const s1 = v.split("<")[1];
			const s2 = s1.split(">")[0];
			return s2 === sender;
		});
		log(`isSenderMatch ${isSenderMatch}`, { debug: true });

		if (isSenderMatch) {
			log(`message ${message}`, { debug: true });

			const url = filterURL("a", "href", message);
			if (url) {
				await clickOnLink(url);
				await imap.markAsSeen(uid);
			}
		}
	}
	await imap.closeImap();
	imap.endImap();
}

async function interactViaOutlook(toMailbox, sender) {
	const client = getOutlookApiClient(toMailbox);
	const startDayDate = moment().startOf("day").toISOString();
	const endDayDate = moment().endOf("day").toISOString();

	const filterCriteria = `isRead ne true and receivedDateTime ge ${startDayDate} and receivedDateTime le ${endDayDate}`;
	let messages = await client
		.api("/me/messages")
		.filter(filterCriteria)
		.select("sender,subject,body")
		.get();

	const messageObj = messages.value.find(
		(v) => v.sender.emailAddress.address === sender
	);
	log(`messageObj ${messageObj}`, { debug: true });

	if (messageObj) {
		const message = messageObj.body.content;

		const url = filterURL("a", "href", message);
		// const url2 = filterURL("img", "src", message);
		if (url) await clickOnLink(url);

		// if (url2) await clickOnLink(url2);

		await client.api(`/me/messages/${messageObj.id}`).update({ isRead: true });
	}
}
const clickOnLink = async (url) => {
	const clearURL = url.replace(/"/g, "");
	log(`Url for clearURL:- ${clearURL}`, {
		debug: true,
	});
	try {
		const res = await axios.get(clearURL);
		if (res) {
			log(`Request res:-`, {
				res,
				debug: true,
			});
		}
	} catch (error) {
		log(`Request Error for test campaign script:---`, {
			error,
			debug: true,
		});
	}
};

const filterURL = (tag, property, message) => {
	if (!message) return;

	const convertedString = message.replace(/=\r\n/g, "");
	const dom = new JSDOM(convertedString);
	const hrefValue = dom.window.document
		.querySelector(tag)
		.getAttribute(property);
	const url = hrefValue.replace(/3D/g, "");
	return url;
};
