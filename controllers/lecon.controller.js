const Lecon = require("../models/lecon.model");
const Cours = require("../models/cours.model");

module.exports.getAllLecons = async (req, res) => {
  try {
    const lecons = await Lecon.find().populate("cours", "titre");
    res.status(200).json({ message: "Lessons retrieved successfully", data: lecons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getLeconById = async (req, res) => {
  try {
    const lecon = await Lecon.findById(req.params.id).populate("cours", "titre");
    if (!lecon) return res.status(404).json({ error: "Leçon not found" });
    res.status(200).json({ message: "Leçon retrieved successfully", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createLecon = async (req, res) => {
  try {
    const { titre, description, duree, contenu, coursId } = req.body;

    const cours = await Cours.findById(coursId);
    if (!cours) return res.status(404).json({ error: "Cours not found" });

    const lecon = await Lecon.create({
      titre, description, duree, contenu, cours: cours._id,
    });

    cours.lecons.push(lecon._id);
    await cours.save();

    res.status(201).json({ message: "Leçon created successfully", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateLecon = async (req, res) => {
  try {
    const updated = await Lecon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Leçon not found" });
    res.status(200).json({ message: "Leçon updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteLecon = async (req, res) => {
  try {
    const lecon = await Lecon.findByIdAndDelete(req.params.id);
    if (!lecon) return res.status(404).json({ error: "Leçon not found" });

    await Cours.findByIdAndUpdate(lecon.cours, { $pull: { lecons: lecon._id } });

    res.status(200).json({ message: "Leçon deleted successfully", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};