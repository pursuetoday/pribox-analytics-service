import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: String,
      enum: ['UNCHECK', 'VALID', 'INVALID', 'UNSURE'],
      default: 'UNCHECK',
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tags' }],
    industry: {
      type: String,
    },
    country: {
      type: String,
    },
    company: {
      type: String,
    },
    position: {
      type: String,
    },
    location: {
      type: String,
    },
    custom: {
      type: mongoose.Schema.Types.Mixed,
    },
    emailVerifyRes: {
      type: mongoose.Schema.Types.Mixed,
    },
    prospectListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'prospect_list',
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

export default mongoose.model('prospect', Schema);
