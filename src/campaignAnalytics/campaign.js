import _ from "lodash";
import CampaignModel from "../models/campaign";
import SenderModel from "../models/mailbox";
import CampaignAnalyticModel from "../models/campaign_analytic";
import ProspectModel from "../models/prospect";
import UnsubscribeEmailModel from "../models/unsubscribe_email";
import log from "../utils/log";

// DB methods to get data from mongo db
async function getCampaign(campaignId) {
	const campaign = await CampaignModel.findById(campaignId);
	return campaign;
}

async function getCampaigns(query, sort) {
	const campaigns = await CampaignModel.find(query).sort(sort);
	return campaigns;
}

async function getSendersByEmails(senderEmails) {
	return await SenderModel.find({
		email: { $in: [...senderEmails] },
		deletedAt: { $exists: false },
	});
}

async function getSenders(senderIds) {
	return await SenderModel.find({
		_id: { $in: [...senderIds] },
		deletedAt: { $exists: false },
	});
}

async function getProspects(campaign) {
	try {
		const { prospects, excludeProspects, sender } = campaign;
		let prospectList = await ProspectModel.find({
			prospectListId: prospects,
			deletedAt: { $exists: false },
		});
		let excludeProspectList = [];
		if (excludeProspects) {
			excludeProspectList = await ProspectModel.find({
				prospectListId: { $in: [...excludeProspects] },
				deletedAt: { $exists: false },
			});
		}
		const unsubscribeEmails = await UnsubscribeEmailModel.find({
			sender: { $in: [...sender] },
			deletedAt: { $exists: false },
		});
		if (excludeProspectList || unsubscribeEmails) {
			const newExcludeProspect = excludeProspectList
				.concat(unsubscribeEmails)
				.map((e) => e.email);
			prospectList = _.filter(
				prospectList,
				(p) => !newExcludeProspect.includes(p.email)
			);
		}

		if (prospectList?.length > 0) return prospectList;
	} catch (err) {
		log(`getProspects Error: ${err?.message || err}`, {
			error: true,
		});
	}
}

// campaign analytics db method

async function saveCampaignAnalytics(newData) {
	try {
		const options = { upsert: true, returnDocument: "after" };
		const { value } = await CampaignAnalyticModel.findOneAndUpdate(
			newData,
			{ $set: {} },
			options
		);
		return value;
	} catch (error) {
		console.error(error);
	}
}

async function updateCampaignAnalytic(query, updateObj) {
	// const {campaignId , prospectId , variantId} = query
	// const {status} = updateObj
	try {
		const updateCampaignAnalytic = await CampaignAnalyticModel.updateOne(
			query,
			{
				$set: updateObj,
			}
		);
		return updateCampaignAnalytic;
	} catch (error) {
		console.error(error);
	}
}

async function getCampaignAnalytic(query, populate = null) {
	// { campaignId , prospectId , variantId } = query
	try {
		return await CampaignAnalyticModel.find(query).populate(populate);
	} catch (error) {
		console.error(error);
	}
}

export default {
	getCampaign,
	getCampaigns,
	getSenders,
	getProspects,
	getSendersByEmails,
	saveCampaignAnalytics,
	updateCampaignAnalytic,
	getCampaignAnalytic,
};
