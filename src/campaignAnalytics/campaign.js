import _ from 'lodash';
import CampaignModel from '../models/campaign';
import SenderModel from '../models/mailbox';
import CampaignAnalyticModel from '../models/campaign_analytic';
import ProspectModel from '../models/prospect';
import UnsubscribeEmailModel from '../models/unsubscribe_email';
import log from '../utils/log';

// DB methods to get data from mongo db
async function getCampaign(campaignId) {
	const campaign = await CampaignModel.findById(campaignId);
	return campaign;
}

async function getCampaigns(query, sort) {
	const campaigns = await CampaignModel.find(query).sort(sort);
	return campaigns;
}

async function getSendersByCampaignsGroup() {
	const currentTimeStamp = new Date();
	const result = await CampaignModel.aggregate([
		{
			$match: {
				status: { $nin: ['ready', 'draft'] },
				deletedAt: null,
			},
		},
		{
			$addFields: {
				endDatePlus5Days: {
					$add: ['$duration.endingAt', 5 * 24 * 60 * 60 * 1000],
				},
			},
		},
		{
			$match: {
				'duration.startingAt': { $lte: currentTimeStamp },
				endDatePlus5Days: { $gte: currentTimeStamp },
			},
		},
		{
			$lookup: {
				from: 'mailboxes',
				let: { sid: '$sender' },
				pipeline: [
					{
						$match: {
							$expr: { $in: ['$_id', '$$sid'] },
							status: 'active',
						},
					},
				],
				as: 'senders',
			},
		},
		{
			$match: {
				senders: { $exists: true, $type: 'array', $ne: [] },
			},
		},
		{ $unwind: '$senders' },
		{
			$group: {
				_id: '$senders._id',
				sender: { $first: '$senders' },
				campaigns: { $addToSet: '$$ROOT' },
			},
		},
		{
			$project: {
				_id: 0,
				sender: 1,
				campaigns: 1,
			},
		},
	]);

	return result;
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
			const newExcludeProspect = excludeProspectList.concat(unsubscribeEmails).map((e) => e.email);
			prospectList = _.filter(prospectList, (p) => !newExcludeProspect.includes(p.email));
		}

		if (prospectList?.length > 0) return prospectList;
	} catch (err) {
		log(`getProspects Error: ${err?.message || err}`, {
			error: true,
			debug: true,
			er: err,
		});
	}
}

// campaign analytics db method

async function saveCampaignAnalytics(newData) {
	try {
		const options = { upsert: true, returnDocument: 'after' };
		const { value } = await CampaignAnalyticModel.findOneAndUpdate(newData, { $set: {} }, options);
		return value;
	} catch (error) {
		console.error(error);
	}
}

async function updateCampaignAnalytic(query, updateObj) {
	// const {campaignId , prospectId , variantId} = query
	// const {status} = updateObj
	try {
		const updateAnalytic = await CampaignAnalyticModel.updateOne(query, {
			$set: updateObj,
		});
		return updateAnalytic;
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
	getSendersByCampaignsGroup,
	getSenders,
	getProspects,
	getSendersByEmails,
	saveCampaignAnalytics,
	updateCampaignAnalytic,
	getCampaignAnalytic,
};
