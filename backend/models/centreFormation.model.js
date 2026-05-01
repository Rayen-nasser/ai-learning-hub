const mongoose = require("mongoose");

const centreFormationSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    adresse: { type: String },
    description: { type: String },
    telephone: { type: String },
    logo: { type: String },
    responsableId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    documents: [{
      type: { 
        type: String, 
        enum: ["registration", "tax_id", "identity", "authorization", "lease"],
        required: true
      },
      path: { type: String, required: true },
      status: { 
        type: String, 
        enum: ["pending", "valid", "invalid"], 
        default: "pending" 
      },
      adminNote: { type: String },
      isPublic: { type: Boolean, default: true }
    }],
    adminMessage: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CentreFormation", centreFormationSchema);