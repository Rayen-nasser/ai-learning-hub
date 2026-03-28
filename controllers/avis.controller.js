const avisModel = require("../models/avis.model");

module.exports.getAllAvis = async (req, res) => {
  try {
    const avis = await avisModel.find()
      .populate("apprenantId", "-password")
      .populate("formationId");
    if (avis.length === 0) {
      throw new Error("No avis found");
    }
    res.status(200).json({ message: "Avis retrieved successfully", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAvisById = async (req, res) => {
  try {
    const avis = await avisModel.findById(req.params.id)
      .populate("apprenantId", "-password")
      .populate("formationId");
    if (!avis) {
      throw new Error("Avis not found");
    }
    res.status(200).json({ message: "Avis retrieved successfully", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createAvis = async (req, res) => {
  try {
    const { apprenantId, formationId, note, commentaire } = req.body;
    const newAvis = new avisModel({ apprenantId, formationId, note, commentaire });
    await newAvis.save();
    res.status(201).json({ message: "Avis created successfully", data: newAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateAvis = async (req, res) => {
  try {
    const updatedAvis = await avisModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAvis) {
      throw new Error("Avis not found");
    }
    res.status(200).json({ message: "Avis updated successfully", data: updatedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteAvis = async (req, res) => {
  try {
    const deletedAvis = await avisModel.findByIdAndDelete(req.params.id);
    if (!deletedAvis) {
      throw new Error("Avis not found");
    }
    res.status(200).json({ message: "Avis deleted successfully", data: deletedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};