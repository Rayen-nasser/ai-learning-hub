const Inscription = require("../models/inscription.model");

module.exports.getAll = async (req, res) => {
  try {
    const inscriptions = await Inscription.find()
      .populate("apprenantId")
      .populate("coursId", "titre prix");
    res.status(200).json({ message: "Inscriptions récupérées avec succès", data: inscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id)
      .populate("apprenantId")
      .populate("coursId", "titre prix");
    if (!inscription) throw new Error("Inscription non trouvée");
    res.status(200).json({ message: "Inscription récupérée avec succès", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { apprenantId, coursId } = req.body;
    const inscription = new Inscription({ apprenantId, coursId });
    await inscription.save();
    res.status(201).json({ message: "Inscription créée avec succès", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.confirmer = async (req, res) => {
  try {
    const inscription = await Inscription.findByIdAndUpdate(
      req.params.id,
      { statut: "confirme" },
      { new: true }
    );
    if (!inscription) throw new Error("Inscription non trouvée");
    res.status(200).json({ message: "Inscription confirmée avec succès", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.annuler = async (req, res) => {
  try {
    const inscription = await Inscription.findByIdAndUpdate(
      req.params.id,
      { statut: "annule" },
      { new: true }
    );
    if (!inscription) throw new Error("Inscription non trouvée");
    res.status(200).json({ message: "Inscription annulée avec succès", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const inscription = await Inscription.findByIdAndDelete(req.params.id);
    if (!inscription) throw new Error("Inscription non trouvée");
    res.status(200).json({ message: "Inscription supprimée avec succès", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET le paiement lié à une inscription
module.exports.getPaiement = async (req, res) => {
  try {
    const Paiement = require("../models/paiement.model");
    const paiement = await Paiement.findOne({ inscriptionId: req.params.id });
    res.status(200).json({ message: "Paiement récupéré avec succès", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};