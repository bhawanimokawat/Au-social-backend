const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate follows
followSchema.index(
  { follower: 1, following: 1 },
  { unique: true }
);

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;