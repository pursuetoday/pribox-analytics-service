import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
	{
		campaignId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaigns',
			required: true,
		},
		executionStartDate: {
			type: Date,
			default: Date.now,
		},
		executionEndDate: {
			type: Date,
		},
		variantId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaign_flow.emailVariants',
		},
		messageId: {
			type: String,
		},
		prospectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'prospect',
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
		},
		totalEmailsSent: {
			type: Number,
			default: 0,
		},
		emailsBounced: {
			type: Number,
			default: 0,
		},
		clicks: {
			type: Number,
			default: 0,
		},
		opened: {
			type: Number,
			default: 0,
		},
		// notreached = (total_prospects - (clicked+opened)/2) * 100 /total_propsects
		receivedReplies: {
			type: Number,
			default: 0,
		},
		unsubscribed: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);

// Duplicate the ID field.
Schema.virtual('id').get(function () {
	return this._id.toHexString();
});

Schema.set('toObject', {
	virtuals: true,
});

Schema.set('toJSON', {
	virtuals: true,
});

export default mongoose.model('campaign_analytic', Schema);
