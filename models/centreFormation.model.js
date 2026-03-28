const mongoose = require("mongoose");

const centreFormationSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    adresse: { type: String },
    description: { type: String },
    telephone: { type: String },
    logo: { type: String },
    responsableId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CentreFormation", centreFormationSchema);