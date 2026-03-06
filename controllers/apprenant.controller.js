const Apprenant = require("../models/apprenant.model");

module.exports.getAll = async (req, res) => {
  try {
    const apprenants = await Apprenant.find().populate("userId", "name email");
    res.status(200).json({ message: "Apprenants récupérés avec succès", data: apprenants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const apprenant = await Apprenant.findById(req.params.id).populate("userId", "name email");
    if (!apprenant) throw new Error("Apprenant non trouvé");
    res.status(200).json({ message: "Apprenant récupéré avec succès", data: apprenant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { userId, niveauEtude, dateNaissance, telephone, adresse } = req.body;
    const apprenant = new Apprenant({ userId, niveauEtude, dateNaissance, telephone, adresse });
    await apprenant.save();
    res.status(201).json({ message: "Apprenant créé avec succès", data: apprenant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { niveauEtude, dateNaissance, telephone, adresse } = req.body;
    const apprenant = await Apprenant.findByIdAndUpdate(
      req.params.id,
      { niveauEtude, dateNaissance, telephone, adresse },
      { new: true }
    );
    if (!apprenant) throw new Error("Apprenant non trouvé");
    res.status(200).json({ message: "Apprenant mis à jour avec succès", data: apprenant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const apprenant = await Apprenant.findByIdAndDelete(req.params.id);
    if (!apprenant) throw new Error("Apprenant non trouvé");
    res.status(200).json({ message: "Apprenant supprimé avec succès", data: apprenant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET toutes les inscriptions d'un apprenant
module.exports.getInscriptions = async (req, res) => {
  try {
    const Inscription = require("../models/inscription.model");
    const inscriptions = await Inscription.find({ apprenantId: req.params.id }).populate("coursId");
    res.status(200).json({ message: "Inscriptions récupérées avec succès", data: inscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET tous les avis d'un apprenant
module.exports.getAvis = async (req, res) => {
  try {
    const Avis = require("../models/avis.model");
    const avis = await Avis.find({ apprenantId: req.params.id }).populate("coursId");
    res.status(200).json({ message: "Avis récupérés avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};