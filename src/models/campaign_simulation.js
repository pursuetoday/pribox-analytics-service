import mongoose from "mongoose";

const Schema = new mongoose.Schema(
	{
		campaignId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "campaign",
			required: true,
		},
		nodeItemId: {
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
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "mailbox",
			required: true,
		},
		nodeItemRefData: {
			type: [String],
			default: [],
		},
		stepType: {
			type: String,
			enum: ["start", "email", "trigger", "delay", "goal"],
		},
		status: {
			enum: ["active", "completed", "failed", "paused"],
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

export default mongoose.model("campaign_simulation", Schema);
