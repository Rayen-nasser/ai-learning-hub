const mongoose = require("mongoose");

const apprenantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    niveauEtude: {
      type: String,
      enum: ["primaire", "secondaire", "bac", "licence", "master", "doctorat"],
      default: "bac",
    },
    dateNaissance: {
      type: Date,
    },
    telephone: {
      type: String,
    },
    adresse: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Apprenant", apprenantSchema);