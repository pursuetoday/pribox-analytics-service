import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		prospect: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'prospect',
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
		},
		deletedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		createdBy: {
			type: String,
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

export default mongoose.model('unsubscribe_email', Schema);
