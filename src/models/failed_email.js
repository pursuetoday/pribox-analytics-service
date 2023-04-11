// Represents an email that failed to send

import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
	{
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox'
		},
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox'
		},
		template: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'email_template'
		},
		errorCode: {
			type: String,
			required: true
		},
		deletedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user'
		},
		deletedAt: {
			type: Date,
			index: true
		}
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt'
		}
	}
);

// Duplicate the ID field.
Schema.virtual('id').get(function () {
	return this._id.toHexString();
});

Schema.set('toObject', {
	virtuals: true
});

Schema.set('toJSON', {
	virtuals: true
});

export default mongoose.model('failed_email', Schema);
