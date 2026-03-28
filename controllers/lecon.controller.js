const leconModel = require("../models/lecon.model");

module.exports.getAllLecons = async (req, res) => {
  try {
    const lecons = await leconModel.find()
      .populate("formationId")
      .populate("formateurId", "-password");
    if (lecons.length === 0) {
      throw new Error("No lecons found");
    }
    res.status(200).json({ message: "Lecons retrieved successfully", data: lecons });
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
      throw new Error("Lecon not found");
    }
    res.status(200).json({ message: "Lecon retrieved successfully", data: lecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createLecon = async (req, res) => {
  try {
    const { titre, description, contenu, formationId, formateurId, estAccessible } = req.body;
    const newLecon = new leconModel({ titre, description, contenu, formationId, formateurId, estAccessible });
    await newLecon.save();
    res.status(201).json({ message: "Lecon created successfully", data: newLecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateLecon = async (req, res) => {
  try {
    const updatedLecon = await leconModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedLecon) {
      throw new Error("Lecon not found");
    }
    res.status(200).json({ message: "Lecon updated successfully", data: updatedLecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteLecon = async (req, res) => {
  try {
    const deletedLecon = await leconModel.findByIdAndDelete(req.params.id);
    if (!deletedLecon) {
      throw new Error("Lecon not found");
    }
    res.status(200).json({ message: "Lecon deleted successfully", data: deletedLecon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};