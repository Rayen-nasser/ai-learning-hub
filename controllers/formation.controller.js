const formationModel = require("../models/formation.model");
const centreFormationModel = require("../models/centreFormation.model");

module.exports.getAllFormations = async (req, res) => {
  try {
    const formations = await formationModel.find()
      .populate("centreId")
      .populate("categorieId");
    if (formations.length === 0) {
      throw new Error("No formations found");
    }
    res.status(200).json({ message: "Formations retrieved successfully", data: formations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getFormationById = async (req, res) => {
  try {
    const formation = await formationModel.findById(req.params.id)
      .populate("centreId")
      .populate("categorieId");
    if (!formation) {
      throw new Error("Formation not found");
    }
    res.status(200).json({ message: "Formation retrieved successfully", data: formation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createFormation = async (req, res) => {
  try {
    const { titre, description, prix, centreId, categorieId, duree } = req.body;
    const newFormation = new formationModel({ titre, description, prix, centreId, categorieId, duree });
    await newFormation.save();
    res.status(201).json({ message: "Formation created successfully", data: newFormation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateFormation = async (req, res) => {
  try {
    const formation = await formationModel.findById(req.params.id);
    if (!formation) {
      throw new Error("Formation not found");
    }
    const updatedFormation = await formationModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: "Formation updated successfully", data: updatedFormation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteFormation = async (req, res) => {
  try {
    const deletedFormation = await formationModel.findByIdAndDelete(req.params.id);
    if (!deletedFormation) {
      throw new Error("Formation not found");
    }
    res.status(200).json({ message: "Formation deleted successfully", data: deletedFormation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};