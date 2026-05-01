const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema(
  {
    apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: true },
    note: { type: Number, min: 1, max: 5, required: true },
    commentaire: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avis", avisSchema);
