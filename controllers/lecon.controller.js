const Lecon = require("../models/lecon.model");

module.exports.getAll = async (req, res) => {
  try {
    const lecons = await Lecon.find()
      .populate("coursId", "titre")
      .populate("formateurId", "specialite")
      .sort({ ordre: 1 });
    res.status(200).json({ message: "Leçons récupérées avec succès", data: lecons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const lecon = await Lecon.findById(req.params.id)
      .populate("coursId", "titre")
      .populate("formateurId", "specialite");
    if (!lecon) throw new Error("Leçon non trouvée");
    res.status(200).json({ message: "Leçon récupérée avec succès", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { titre, contenu, ordre, coursId, formateurId, duree, videoUrl } = req.body;
    const lecon = new Lecon({ titre, contenu, ordre, coursId, formateurId, duree, videoUrl });
    await lecon.save();
    res.status(201).json({ message: "Leçon créée avec succès", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { titre, contenu, duree, videoUrl } = req.body;
    const lecon = await Lecon.findByIdAndUpdate(
      req.params.id,
      { titre, contenu, duree, videoUrl },
      { new: true }
    );
    if (!lecon) throw new Error("Leçon non trouvée");
    res.status(200).json({ message: "Leçon mise à jour avec succès", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const lecon = await Lecon.findByIdAndDelete(req.params.id);
    if (!lecon) throw new Error("Leçon non trouvée");
    res.status(200).json({ message: "Leçon supprimée avec succès", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Changer l'ordre d'une leçon
module.exports.changerOrdre = async (req, res) => {
  try {
    const { ordre } = req.body;
    const lecon = await Lecon.findByIdAndUpdate(
      req.params.id,
      { ordre },
      { new: true }
    );
    if (!lecon) throw new Error("Leçon non trouvée");
    res.status(200).json({ message: "Ordre mis à jour avec succès", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};