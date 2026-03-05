const Avis = require("../models/avis.model");

module.exports.getAll = async (req, res) => {
  try {
    const avis = await Avis.find()
      .populate("apprenantId")
      .populate("coursId", "titre");
    res.status(200).json({ message: "Avis récupérés avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const avis = await Avis.findById(req.params.id)
      .populate("apprenantId")
      .populate("coursId", "titre");
    if (!avis) throw new Error("Avis non trouvé");
    res.status(200).json({ message: "Avis récupéré avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { apprenantId, coursId, note } = req.body;
    const avis = new Avis({ apprenantId, coursId, note });
    await avis.save();
    res.status(201).json({ message: "Avis créé avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { note } = req.body;
    const avis = await Avis.findByIdAndUpdate(
      req.params.id,
      { note },
      { new: true }
    );
    if (!avis) throw new Error("Avis non trouvé");
    res.status(200).json({ message: "Avis mis à jour avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.valider = async (req, res) => {
  try {
    const avis = await Avis.findByIdAndUpdate(
      req.params.id,
      { statut: "valide" },
      { new: true }
    );
    if (!avis) throw new Error("Avis non trouvé");
    res.status(200).json({ message: "Avis validé avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.rejeter = async (req, res) => {
  try {
    const avis = await Avis.findByIdAndUpdate(
      req.params.id,
      { statut: "rejete" },
      { new: true }
    );
    if (!avis) throw new Error("Avis non trouvé");
    res.status(200).json({ message: "Avis rejeté avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const avis = await Avis.findByIdAndDelete(req.params.id);
    if (!avis) throw new Error("Avis non trouvé");
    res.status(200).json({ message: "Avis supprimé avec succès", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};