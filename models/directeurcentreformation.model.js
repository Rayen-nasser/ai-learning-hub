const mongoose = require("mongoose");

const directeurCentreFormationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nomCentre: {
      type: String,
      required: [true, "Nom du centre est requis"],
      trim: true,
    },
    adresse: {
      type: String,
      required: [true, "Adresse est requise"],
    },
    telephone: {
      type: String,
      required: [true, "Téléphone est requis"],
    },
    siteWeb: {
      type: String,
      default: "",
    },
    statut: {
      type: String,
      enum: ["actif", "inactif", "suspendu"],
      default: "actif",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DirecteurCentreFormation", directeurCentreFormationSchema);