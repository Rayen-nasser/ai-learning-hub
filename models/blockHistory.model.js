const mongoose = require("mongoose");

const blockHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["blocked", "unblocked"], required: true },
    reason: { type: String },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockHistory", blockHistorySchema);
