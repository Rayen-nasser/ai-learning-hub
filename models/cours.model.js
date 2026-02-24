const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: { type: String, required: true },
    prix: { type: Number, default: 0 },
    image: { type: String },

    statut: { type: String, enum: ["publie", "depublie"], default: "depublie" },

    // Formateur qui a créé le cours
    formateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // contient plusieurs leçons
    lecons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecon" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cours", coursSchema);