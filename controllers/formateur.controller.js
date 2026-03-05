const Formateur = require("../models/formateur.model");

module.exports.getAll = async (req, res) => {
  try {
    const formateurs = await Formateur.find()
      .populate("userId", "name email")
      .populate("centreId", "nomCentre");
    res.status(200).json({ message: "Formateurs récupérés avec succès", data: formateurs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const formateur = await Formateur.findById(req.params.id)
      .populate("userId", "name email")
      .populate("centreId", "nomCentre");
    if (!formateur) throw new Error("Formateur non trouvé");
    res.status(200).json({ message: "Formateur récupéré avec succès", data: formateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { userId, specialite, biographie, experience, centreId, dateRattachement } = req.body;
    const formateur = new Formateur({ userId, specialite, biographie, experience, centreId, dateRattachement });
    await formateur.save();
    res.status(201).json({ message: "Formateur créé avec succès", data: formateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { specialite, biographie, experience } = req.body;
    const formateur = await Formateur.findByIdAndUpdate(
      req.params.id,
      { specialite, biographie, experience },
      { new: true }
    );
    if (!formateur) throw new Error("Formateur non trouvé");
    res.status(200).json({ message: "Formateur mis à jour avec succès", data: formateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const formateur = await Formateur.findByIdAndDelete(req.params.id);
    if (!formateur) throw new Error("Formateur non trouvé");
    res.status(200).json({ message: "Formateur supprimé avec succès", data: formateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rattacher un formateur à un centre
module.exports.rattacherACentre = async (req, res) => {
  try {
    const { centreId } = req.body;
    const formateur = await Formateur.findByIdAndUpdate(
      req.params.id,
      { centreId, dateRattachement: Date.now() },
      { new: true }
    );
    if (!formateur) throw new Error("Formateur non trouvé");
    res.status(200).json({ message: "Formateur rattaché au centre avec succès", data: formateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Détacher un formateur de son centre
module.exports.detacherDuCentre = async (req, res) => {
  try {
    const formateur = await Formateur.findByIdAndUpdate(
      req.params.id,
      { centreId: null, dateRattachement: null },
      { new: true }
    );
    if (!formateur) throw new Error("Formateur non trouvé");
    res.status(200).json({ message: "Formateur détaché du centre avec succès", data: formateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET toutes les leçons d'un formateur
module.exports.getLecons = async (req, res) => {
  try {
    const Lecon = require("../models/lecon.model");
    const lecons = await Lecon.find({ formateurId: req.params.id }).populate("coursId", "titre");
    res.status(200).json({ message: "Leçons récupérées avec succès", data: lecons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};