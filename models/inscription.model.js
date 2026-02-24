const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema(
  {
    apprenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cours: { type: mongoose.Schema.Types.ObjectId, ref: "Cours", required: true },

    dateInscription: { type: Date, default: Date.now },

    statutPaiement: {
      type: String,
      enum: ["payee", "en_attente", "annulee"],
      default: "en_attente",
    },

    montant: { type: Number, default: 0 },

    progression: {
      completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecon" }],
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Méthodes comme dans ton diagramme
inscriptionSchema.methods.payer = function () {
  this.statutPaiement = "payee";
  return this.save();
};

inscriptionSchema.methods.annuler = function () {
  this.statutPaiement = "annulee";
  return this.save();
};

inscriptionSchema.methods.mettreAJourProgression = function (leconId) {
  if (!this.progression.completedLessons.includes(leconId)) {
    this.progression.completedLessons.push(leconId);
  }
  return this.save();
};

inscriptionSchema.methods.marquerCommeComplete = function () {
  this.progression.isCompleted = true;
  this.progression.completedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Inscription", inscriptionSchema);