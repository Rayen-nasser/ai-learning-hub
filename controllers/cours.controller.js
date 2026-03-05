const Cours = require("../models/cours.model");

module.exports.getAll = async (req, res) => {
  try {
    const cours = await Cours.find()
      .populate("formateurId", "specialite")
      .populate("directeurId", "nomCentre");
    res.status(200).json({ message: "Cours récupérés avec succès", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id)
      .populate("formateurId", "specialite")
      .populate("directeurId", "nomCentre");
    if (!cours) throw new Error("Cours non trouvé");
    res.status(200).json({ message: "Cours récupéré avec succès", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { titre, description, prix, duree, mode, categorie, formateurId, directeurId, statut } = req.body;
    const cours = new Cours({ titre, description, prix, duree, mode, categorie, formateurId, directeurId, statut });
    await cours.save();
    res.status(201).json({ message: "Cours créé avec succès", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { titre, description, prix, duree, mode, categorie, statut } = req.body;
    const cours = await Cours.findByIdAndUpdate(
      req.params.id,
      { titre, description, prix, duree, mode, categorie, statut },
      { new: true }
    );
    if (!cours) throw new Error("Cours non trouvé");
    res.status(200).json({ message: "Cours mis à jour avec succès", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const cours = await Cours.findByIdAndDelete(req.params.id);
    if (!cours) throw new Error("Cours non trouvé");
    res.status(200).json({ message: "Cours supprimé avec succès", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET toutes les leçons d'un cours
module.exports.getLecons = async (req, res) => {
  try {
    const Lecon = require("../models/lecon.model");
    const lecons = await Lecon.find({ coursId: req.params.id }).sort({ ordre: 1 });
    res.status(200).json({ message: "Leçons récupérées avec succès", data: lecons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET moyenne des notes d'un cours
module.exports.getMoyenneNote = async (req, res) => {
  try {
    const Avis = require("../models/avis.model");
    const avis = await Avis.find({ coursId: req.params.id, statut: "valide" });
    if (avis.length === 0) {
      return res.status(200).json({ message: "Aucun avis pour ce cours", moyenne: 0 });
    }
    const moyenne = avis.reduce((sum, a) => sum + a.note, 0) / avis.length;
    res.status(200).json({ message: "Moyenne calculée avec succès", moyenne: moyenne.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};