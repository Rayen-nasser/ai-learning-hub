const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema(
  {
    inscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inscription",
      required: true,
    },

    // ── Montant en Dinar Tunisien ────────────────────────
    montant: {
      type: Number,
      required: [true, "Montant est requis"],
      min: 0,
    },
    devise: {
      type: String,
      default: "DNT",
      immutable: true, // toujours DNT
    },

    // ── Méthodes de paiement tunisiennes ─────────────────
    methode: {
      type: String,
      enum: [
        "carte_bancaire_locale", // Carte CIB / VISA locale (banques TN)
        "virement_bancaire",     // Virement inter-bancaire tunisien
        "postepay",              // Paiement via La Poste Tunisienne
      ],
      required: [true, "Méthode de paiement est requise"],
    },

    // ── Statut ───────────────────────────────────────────
    statut: {
      type: String,
      enum: ["en_attente", "valide", "rembourse", "echoue", "annule"],
      default: "en_attente",
    },

    // ── Référence & traçabilité ──────────────────────────
    reference: {
      type: String,
      unique: true,
      default: () =>
        `PAY-TN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    },
    datePaiement: {
      type: Date,
      default: null,
    },
    dateRemboursement: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paiement", paiementSchema);