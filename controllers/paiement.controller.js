const Paiement = require("../models/paiement.model");

module.exports.getAll = async (req, res) => {
  try {
    const paiements = await Paiement.find().populate("inscriptionId");
    res.status(200).json({ message: "Paiements récupérés avec succès", data: paiements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id).populate("inscriptionId");
    if (!paiement) throw new Error("Paiement non trouvé");
    res.status(200).json({ message: "Paiement récupéré avec succès", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Créer un paiement ────────────────────────────────────
module.exports.create = async (req, res) => {
  try {
    const { inscriptionId, montant, methode, notes } = req.body;

    const paiement = new Paiement({
      inscriptionId,
      montant,
      devise: "DNT",
      methode,
      notes,
    });

    await paiement.save();

    res.status(201).json({
      message: "Paiement créé avec succès",
      data: paiement,
      info: {
        montantPaye: `${montant} DNT`,
        methode,
        reference: paiement.reference,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Valider un paiement ──────────────────────────────────
module.exports.valider = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      { statut: "valide", datePaiement: Date.now() },
      { new: true }
    );
    if (!paiement) throw new Error("Paiement non trouvé");
    res.status(200).json({ message: "Paiement validé avec succès", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Rembourser un paiement ───────────────────────────────
module.exports.rembourser = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id);
    if (!paiement) throw new Error("Paiement non trouvé");
    if (paiement.statut !== "valide") {
      return res.status(400).json({ error: "Seul un paiement validé peut être remboursé" });
    }
    paiement.statut = "rembourse";
    paiement.dateRemboursement = Date.now();
    await paiement.save();
    res.status(200).json({ message: "Paiement remboursé avec succès", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Annuler un paiement ──────────────────────────────────
module.exports.annuler = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      { statut: "annule" },
      { new: true }
    );
    if (!paiement) throw new Error("Paiement non trouvé");
    res.status(200).json({ message: "Paiement annulé avec succès", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Supprimer ────────────────────────────────────────────
module.exports.remove = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndDelete(req.params.id);
    if (!paiement) throw new Error("Paiement non trouvé");
    res.status(200).json({ message: "Paiement supprimé avec succès", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Méthodes disponibles ─────────────────────────────────
module.exports.getMethodes = async (req, res) => {
  res.status(200).json({
    message: "Méthodes de paiement disponibles en Tunisie",
    devise: "DNT 🇹🇳",
    methodes: [
      { code: "carte_bancaire_locale", label: "Carte bancaire locale (CIB / VISA locale)" },
      { code: "virement_bancaire",     label: "Virement bancaire tunisien" },
      { code: "postepay",              label: "La Poste Tunisienne" },
    ],
  });
};