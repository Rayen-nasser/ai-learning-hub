const Cours = require("../models/cours.model");
const Formateur = require("../models/formateur.model");
const Lecon = require("../models/lecon.model");

module.exports.getAllCours = async (req, res) => {
  try {
    const { statut } = req.query; // optionnel: ?statut=publie
    const filter = statut ? { statut } : {};
    const cours = await Cours.find(filter)
      .populate("formateur", "name prenom email role")
      .populate("lecons");
    res.status(200).json({ message: "Courses retrieved successfully", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getCoursById = async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id)
      .populate("formateur", "name prenom email role")
      .populate("lecons");
    if (!cours) return res.status(404).json({ error: "Cours not found" });
    res.status(200).json({ message: "Cours retrieved successfully", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createCours = async (req, res) => {
  try {
    const { titre, description, prix, image, formateurId } = req.body;

    const formateur = await Formateur.findById(formateurId);
    if (!formateur) return res.status(404).json({ error: "Formateur not found" });

    const newCours = await Cours.create({
      titre,
      description,
      prix,
      image,
      formateur: formateur._id,
    });

    res.status(201).json({ message: "Cours created successfully", data: newCours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateCours = async (req, res) => {
  try {
    const updated = await Cours.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Cours not found" });
    res.status(200).json({ message: "Cours updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteCours = async (req, res) => {
  try {
    const deleted = await Cours.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Cours not found" });

    // optionnel: supprimer leçons liées
    await Lecon.deleteMany({ cours: deleted._id });

    res.status(200).json({ message: "Cours deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.publierCours = async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);
    if (!cours) return res.status(404).json({ error: "Cours not found" });
    cours.statut = "publie";
    await cours.save();
    res.status(200).json({ message: "Cours published", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.depublierCours = async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);
    if (!cours) return res.status(404).json({ error: "Cours not found" });
    cours.statut = "depublie";
    await cours.save();
    res.status(200).json({ message: "Cours unpublished", data: cours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// créer une leçon et l'ajouter au cours
module.exports.ajouterLecon = async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);
    if (!cours) return res.status(404).json({ error: "Cours not found" });

    const { titre, description, duree, contenu } = req.body;

    const lecon = await Lecon.create({
      titre,
      description,
      duree,
      contenu,
      cours: cours._id,
    });

    cours.lecons.push(lecon._id);
    await cours.save();

    res.status(201).json({ message: "Leçon ajoutée", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};