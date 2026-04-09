const leconModel = require("../models/lecon.model");
const formationModel = require("../models/formation.model");
const userModel = require("../models/user.model");

module.exports.getAllLecons = async (req, res) => {
  try {
    const lecons = await leconModel.find()
      .populate("formationId")
      .populate("formateurId", "-password");
    if (lecons.length === 0) {
      return res.status(404).json({ message: "No lessons found" });
    }
    res.status(200).json({ message: "Lessons retrieved successfully", data: lecons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getLeconById = async (req, res) => {
  try {
    const lecon = await leconModel.findById(req.params.id)
      .populate("formationId")
      .populate("formateurId", "-password");
    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.status(200).json({ message: "Lesson retrieved successfully", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createLecon = async (req, res) => {
  try {
    const { titre, description, contenu, duree, formationId, formateurId, estAccessible } = req.body;

    if (!titre) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    if (formationId) {
      const formation = await formationModel.findById(formationId);
      if (!formation) {
        return res.status(400).json({ message: "Formation not found" });
      }
    }

    const finalFormateurId = formateurId || req.user._id;

    if (formateurId) {
      const formateur = await userModel.findById(formateurId);
      if (!formateur) {
        return res.status(400).json({ message: "Formateur not found" });
      }
    }

    const newLecon = new leconModel({
      titre,
      description,
      contenu,
      duree,
      formationId,
      formateurId: finalFormateurId,
      estAccessible: estAccessible || false,
    });
    await newLecon.save();
    const populatedLecon = await leconModel.findById(newLecon._id)
      .populate("formationId")
      .populate("formateurId", "-password");
    res.status(201).json({ message: "Lesson created successfully", data: populatedLecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateLecon = async (req, res) => {
  try {
    const lecon = await leconModel.findById(req.params.id);
    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const isOwner = lecon.formateurId && lecon.formateurId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only update your own lessons." });
    }

    const { titre, description, contenu, duree, estAccessible } = req.body;

    const updates = {};
    if (titre) updates.titre = titre;
    if (description !== undefined) updates.description = description;
    if (contenu !== undefined) updates.contenu = contenu;
    if (duree !== undefined) updates.duree = duree;
    if (estAccessible !== undefined) updates.estAccessible = estAccessible;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedLecon = await leconModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("formationId").populate("formateurId", "-password");

    res.status(200).json({ message: "Lesson updated successfully", data: updatedLecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteLecon = async (req, res) => {
  try {
    const deletedLecon = await leconModel.findByIdAndDelete(req.params.id);
    if (!deletedLecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
