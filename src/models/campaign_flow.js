import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
	{
		campaign: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaign',
			index: true,
		},
		stepType: {
			type: String,
			enum: ['start', 'email', 'trigger', 'delay', 'goal'],
			default: 'start',
		},
		parentStep: { type: mongoose.Schema.Types.ObjectId, ref: 'campaign_flow' },
		parentStepType: {
			type: String,
			enum: ['yes', 'no', 'default'],
			default: 'default',
		},
		tag: String,
		goalName: String,
		waitDelay: { type: Number, default: 0 },
		triggerDelay: { type: Number, default: 0 },
		triggerCondition: {
			type: String,
			enum: ['opened', 'clicked', 'booked'],
		},
		emailVariants: [
			{
				variantNumber: {
					type: String,
					enum: ['A', 'B', 'C', 'D', 'E'],
				},
				emailTemplateId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'campaigns_templates',
				},
				emailSubject: String,
				emailBody: String,
				templateName: String,
				isPause: { type: Boolean, default: false },
			},
		],
		location: {
			x: Number,
			y: Number,
		},
		deletedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		deletedAt: Date,
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
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
Schema.index({ tag: 'text' });

export default mongoose.model('campaign_flow', Schema);
