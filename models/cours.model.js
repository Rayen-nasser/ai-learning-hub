const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Titre est requis"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    prix: {
      type: Number,
      required: [true, "Prix est requis"],
      min: 0,
    },
    duree: {
      type: String,
      default: "",
    },
    mode: {
      type: String,
      enum: ["presentiel", "enligne", "hybride"],
      default: "enligne",
    },
    categorie: {
      type: String,
      default: "",
    },
    formateurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formateur",
      required: true,
    },
    directeurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirecteurCentreFormation",
      required: true,
    },
    statut: {
      type: String,
      enum: ["actif", "inactif", "archive"],
      default: "actif",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cours", coursSchema);