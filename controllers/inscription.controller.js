const Inscription = require("../models/inscription.model");
const Cours = require("../models/cours.model");
const Learner = require("../models/learner.model");

module.exports.getAllInscriptions = async (req, res) => {
  try {
    const inscriptions = await Inscription.find()
      .populate("apprenant", "name prenom email role")
      .populate("cours", "titre prix statut");
    res.status(200).json({ message: "Inscriptions retrieved successfully", data: inscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getInscriptionById = async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id)
      .populate("apprenant", "name prenom email role")
      .populate("cours", "titre prix statut")
      .populate("progression.completedLessons");
    if (!inscription) return res.status(404).json({ error: "Inscription not found" });
    res.status(200).json({ message: "Inscription retrieved successfully", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createInscription = async (req, res) => {
  try {
    const { apprenantId, coursId } = req.body;

    const apprenant = await Learner.findById(apprenantId);
    if (!apprenant) return res.status(404).json({ error: "Apprenant not found" });

    const cours = await Cours.findById(coursId);
    if (!cours) return res.status(404).json({ error: "Cours not found" });

    const existing = await Inscription.findOne({ apprenant: apprenantId, cours: coursId });
    if (existing) return res.status(400).json({ error: "Already enrolled in this course" });

    const inscription = await Inscription.create({
      apprenant: apprenant._id,
      cours: cours._id,
      montant: cours.prix,
      statutPaiement: "en_attente",
    });

    res.status(201).json({ message: "Inscription created successfully", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.payerInscription = async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) return res.status(404).json({ error: "Inscription not found" });
    const updated = await inscription.payer();
    res.status(200).json({ message: "Payment done", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.annulerInscription = async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) return res.status(404).json({ error: "Inscription not found" });
    const updated = await inscription.annuler();
    res.status(200).json({ message: "Inscription canceled", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.mettreAJourProgression = async (req, res) => {
  try {
    const { leconId } = req.body;
    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) return res.status(404).json({ error: "Inscription not found" });

    const updated = await inscription.mettreAJourProgression(leconId);
    res.status(200).json({ message: "Progress updated", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.marquerCoursComplete = async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) return res.status(404).json({ error: "Inscription not found" });

    const updated = await inscription.marquerCommeComplete();
    res.status(200).json({ message: "Course marked completed", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteInscription = async (req, res) => {
  try {
    const deleted = await Inscription.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Inscription not found" });
    res.status(200).json({ message: "Inscription deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};