const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema(
  {
    inscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Inscription", required: true },
    apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    montant: { type: Number, required: true },
    statut: {
      type: String,
      enum: ["en attente", "confirmé", "refusé"],
      default: "en attente",
    },
    methodePaiement: {
      type: String,
      enum: ["carte", "virement", "especes"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paiement", paiementSchema);
