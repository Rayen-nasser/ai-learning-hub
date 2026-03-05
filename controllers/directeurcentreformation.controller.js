const DirecteurCentreFormation = require("../models/directeurCentreFormation.model");

module.exports.getAll = async (req, res) => {
  try {
    const directeurs = await DirecteurCentreFormation.find().populate("userId", "name email");
    res.status(200).json({ message: "Directeurs récupérés avec succès", data: directeurs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const directeur = await DirecteurCentreFormation.findById(req.params.id).populate("userId", "name email");
    if (!directeur) throw new Error("Directeur non trouvé");
    res.status(200).json({ message: "Directeur récupéré avec succès", data: directeur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { userId, nomCentre, adresse, telephone, siteWeb, statut } = req.body;
    const directeur = new DirecteurCentreFormation({ userId, nomCentre, adresse, telephone, siteWeb, statut });
    await directeur.save();
    res.status(201).json({ message: "Directeur créé avec succès", data: directeur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { nomCentre, adresse, telephone, siteWeb, statut } = req.body;
    const directeur = await DirecteurCentreFormation.findByIdAndUpdate(
      req.params.id,
      { nomCentre, adresse, telephone, siteWeb, statut },
      { new: true }
    );
    if (!directeur) throw new Error("Directeur non trouvé");
    res.status(200).json({ message: "Directeur mis à jour avec succès", data: directeur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const directeur = await DirecteurCentreFormation.findByIdAndDelete(req.params.id);
    if (!directeur) throw new Error("Directeur non trouvé");
    res.status(200).json({ message: "Directeur supprimé avec succès", data: directeur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET toutes les formations publiées par ce directeur
module.exports.getFormations = async (req, res) => {
  try {
    const Cours = require("../models/cours.model");
    const cours = await Cours.find({ directeurId: req.params.id });
    res.status(200).json({ message: "Formations récupérées avec succès", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET tous les formateurs rattachés à ce directeur
module.exports.getFormateurs = async (req, res) => {
  try {
    const Formateur = require("../models/formateur.model");
    const formateurs = await Formateur.find({ centreId: req.params.id }).populate("userId", "name email");
    res.status(200).json({ message: "Formateurs récupérés avec succès", data: formateurs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};