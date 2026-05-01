const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    type: { 
      type: String, 
      enum: [
        "paiement_pending",
        "paiement_confirmed",
        "inscription_request",
        "inscription_accepted",
        "inscription_rejected",
        "report_submitted",
        "report_resolved",
        "new_formation",
        "system"
      ], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String, enum: ["Paiement", "Inscription", "Formation", "Report", null] },
    read: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
