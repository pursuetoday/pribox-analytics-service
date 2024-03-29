import mongoose from 'mongoose';
import { getEncryptedPassword } from '../utils/encryption';

const Schema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
		},
		email: {
			type: String,
			index: true,
			lowercase: true,
			required: true,
		},
		password: {
			type: String,
		},
		isDomainCheck: {
			type: Boolean,
		},
		isDomain: {
			isDmarc: {
				type: Boolean,
			},
			isBlackList: {
				type: Boolean,
			},
			isDkim: {
				type: Boolean,
			},
		},
		senderName: {
			type: String,
		},
		signature: {
			type: String,
		},
		config: {
			messagePerDay: {
				type: Number,
			},
			fixedDelay: {
				type: Number,
			},
			randomDelay: {
				from: {
					type: Number,
				},
				to: {
					type: Number,
				},
			},
			bcc: {
				type: String,
			},
			customTrackingDomain: {
				type: String,
			},
		},
		provider: {
			type: String,
			default: 'custom',
		},
		isWarmUp: {
			type: String,
			default: false,
		},
		social: {
			userId: {
				type: String,
			},
			accessToken: {
				type: String,
			},
			refreshToken: {
				type: String,
			},
			expiresAt: {
				type: Date,
			},
		},
		smtp: {
			username: {
				type: String,
			},
			password: {
				type: String,
			},
			host: {
				type: String,
			},
			port: {
				type: Number,
			},
			security: {
				type: String,
				enum: ['ssl/tls', 'insecure', null],
			},
		},
		imap: {
			username: {
				type: String,
			},
			password: {
				type: String,
			},
			host: {
				type: String,
			},
			port: {
				type: Number,
			},
			security: {
				type: String,
				enum: ['ssl/tls', 'insecure', null],
			},
		},
		tags: [
			{
				type: String,
			},
		],
		status: {
			type: String,
			enum: ['active', 'inactive', 'suspended'],
			default: 'active',
		},
		timezoneOffset: {
			type: Number,
			default: 0,
		},
		suspendedAt: {
			type: Date,
		},
		suspendedRaw: {
			type: Object,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		receivingPriority: {
			type: Number,
			default: 0,
		},
		bulkCreated: {
			type: Boolean,
			default: false,
		},
		isOurs: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
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

Schema.pre('save', function (next) {
	if (this.isModified('password')) {
		this.password = getEncryptedPassword(this.password);
	}
	if (this.isModified('smtp.password')) {
		this.smtp.password = getEncryptedPassword(this.smtp.password);
	}
	if (this.isModified('imap.password')) {
		this.imap.password = getEncryptedPassword(this.imap.password);
	}
	next();
});
Schema.index({ email: 'text' });
export default mongoose.model('mailbox', Schema);
