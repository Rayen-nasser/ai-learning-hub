const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema(
  {
    apprenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apprenant",
      required: true,
    },
    coursId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cours",
      required: true,
    },
    dateInscription: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ["en_attente", "confirme", "annule"],
      default: "en_attente",
    },
  },
  { timestamps: true }
);

// Un apprenant ne peut pas s'inscrire deux fois au même cours
inscriptionSchema.index({ apprenantId: 1, coursId: 1 }, { unique: true });

module.exports = mongoose.model("Inscription", inscriptionSchema);