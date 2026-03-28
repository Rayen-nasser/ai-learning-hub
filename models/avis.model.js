const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema(
  {
    apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation" },
    note: { type: Number, min: 1, max: 5 },
    commentaire: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avis", avisSchema);