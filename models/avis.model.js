const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema(
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
    note: {
      type: Number,
      required: [true, "Note est requise"],
      min: 1,
      max: 5,
    },
    dateAvis: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ["en_attente", "valide", "rejete"],
      default: "en_attente",
    },
  },
  { timestamps: true }
);

// Un apprenant ne peut laisser qu'un seul avis par cours
avisSchema.index({ apprenantId: 1, coursId: 1 }, { unique: true });

module.exports = mongoose.model("Avis", avisSchema);