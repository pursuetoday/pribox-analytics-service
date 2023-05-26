import CampaignModel from "../models/campaign";
import SenderModel from "../models/mailbox";
import CampaignAnalyticModel from "../models/campaign_analytic";

// DB methods to get data from mongo db
async function getCampaign(campaignId) {
	const campaign = await CampaignModel.findById(campaignId);
	return campaign;
}

async function getCampaigns(query, sort) {
	const campaigns = await CampaignModel.find(query).sort(sort);
	return campaigns;
}

async function getSenders(senderIds) {
	return await SenderModel.find({
		_id: { $in: [...senderIds] },
		deletedAt: { $exists: false },
	});
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
	saveCampaignAnalytics,
	updateCampaignAnalytic,
	getCampaignAnalytic,
};
