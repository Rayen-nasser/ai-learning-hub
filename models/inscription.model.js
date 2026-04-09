const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema(
  {
    apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: true },
    statut: {
      type: String,
      enum: ["en attente", "acceptée", "refusée"],
      default: "en attente",
    },
    dateInscription: { type: Date, default: Date.now },
    dateAcceptation: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inscription", inscriptionSchema);
