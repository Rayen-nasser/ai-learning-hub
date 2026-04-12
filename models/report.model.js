const mongoose = require("mongoose");

const REPORT_REASONS = {
  user: ["Spam", "Harassment", "Fake Profile", "Inappropriate Content", "Other"],
  formation: ["Scam", "Inappropriate Content", "Fake Information", "Duplicate", "Other"],
  centre: ["Fake Center", "Fraud", "Inappropriate Content", "Other"],
  formateur: ["Bad Teaching", "Harassment", "Inappropriate Behavior", "Other"],
};

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reporterRole: { type: String },
    type: {
      type: String,
      enum: ["user", "formation", "centre", "formateur"],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: [], // Will be validated dynamically
      required: true,
    },
    description: { type: String },
    reportsCount: { type: Number, default: 1 },
    reporters: [{
      reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      description: String,
      reportedAt: { type: Date, default: Date.now },
    }],
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: String,
    action: String,
    resolvedAt: Date,
  },
  { timestamps: true }
);

reportSchema.statics.REPORT_REASONS = REPORT_REASONS;

reportSchema.methods.getValidReasons = function() {
  return REPORT_REASONS[this.type] || [];
};

module.exports = mongoose.model("Report", reportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
