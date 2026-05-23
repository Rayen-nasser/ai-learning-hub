const mongoose = require("mongoose");

const formateurContratSchema = new mongoose.Schema(
  {
    formateurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: "CentreFormation", required: true },
    mode: {
      type: String,
      enum: ["par_lecon", "montant_fixe"],
      required: true,
    },
    montantFixe: { type: Number, default: 0 },
    prixParLecon: { type: Number, default: 0 },
    statut: {
      type: String,
      enum: ["en_attente", "actif", "termine"],
      default: "en_attente",
    },
    dateDebut: { type: Date, default: Date.now },
    dateFin: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormateurContrat", formateurContratSchema);
