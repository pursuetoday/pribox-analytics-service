import mongoose from "mongoose";

const Schema = new mongoose.Schema(
	{
		campaignId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "campaigns",
			required: true,
		},
		flowItemId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "campaign_flow",
			required: true,
		},
		prospectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "prospect",
			required: true,
			index: true,
		},
		status: {
			enum: ["active" , "queue" , "completed", "paused"],
			default: "active",
			type: String,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		},
	}
);

// Duplicate the ID field.
Schema.virtual("id").get(function () {
	return this._id.toHexString();
});

Schema.set("toObject", {
	virtuals: true,
});

Schema.set("toJSON", {
	virtuals: true,
});

export default mongoose.model("campaign_email_queue", Schema);
// no need for this collection because trigger is prospect base not campaign