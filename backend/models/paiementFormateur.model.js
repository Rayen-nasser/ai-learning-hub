const mongoose = require("mongoose");

const paiementFormateurSchema = new mongoose.Schema(
  {
    contratId: { type: mongoose.Schema.Types.ObjectId, ref: "FormateurContrat" },
    formateurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation", required: true },
    montant: { type: Number, required: true },
    mode: {
      type: String,
      default: "par_lecon",
    },
    leconId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecon" },
    leconTitre: { type: String },
    formationTitre: { type: String },
    statut: {
      type: String,
      enum: ["en_attente", "paye", "refuse"],
      default: "en_attente",
    },
    methodePaiement: {
      type: String,
      enum: ["virement", "especes"],
    },
    datePaiement: { type: Date },
    reference: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaiementFormateur", paiementFormateurSchema);
