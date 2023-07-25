import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
	{
		name: String,
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			index: true,
			ref: 'mailbox',
		},
		status: {
			type: String,
			enum: ['draft', 'ready', 'active', 'paused', 'completed'],
			default: 'draft',
			index: true,
		},
		duration: {
			startingAt: Date,
			endingAt: Date,
			timezoneUTC: String,
		},
		selectedSchedule: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaign_schedules',
		},
		prospects: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'prospect_list',
		},
		excludeProspects: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'prospect_list',
			},
		],
		sendTo: {
			type: String,
			enum: ['all', 'first'],
			default: 'all',
		},
		missingVariableCase: {
			type: String,
			enum: ['send anyway', 'send to checklist'],
			default: 'send to checklist',
		},
		donotSendTo: {
			unverified: Boolean,
			unverifiable: Boolean,
		},
		openTracking: {
			type: Boolean,
			default: true,
		},
		linkTracking: {
			type: Boolean,
			default: true,
		},
		donotSendToResponders: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		deletedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		deletedAt: Date,
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

Schema.index({ name: 'text', status: 'text' });
Schema.set('autoIndex', true);

export default mongoose.model('campaign', Schema);
