import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    unsubcribedList: {
      type: Boolean,
      default: false,
    },
    header: [{ type: mongoose.Schema.Types.ObjectId, ref: "prospect_field" }],
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    deletedAt: {
      type: Date,
      index: true,
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
Schema.index({ name: "text" });

export default mongoose.model("prospect_list", Schema);
