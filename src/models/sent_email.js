import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
	{
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
		},
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
		},
		date: {
			type: Date,
			required: true,
		},
		template: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'email_template',
		},
		messageId: {
			type: String,
		},
		isReply: {
			type: Boolean,
		},
		inReplyTo: {
			type: String,
		},
		hasInteracted: {
			type: Boolean,
			default: false,
		},
		interactionTime: {
			type: Date,
		},
		deletedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		deletedAt: {
			type: Date,
			index: true,
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

export default mongoose.model('sent_email', Schema);
