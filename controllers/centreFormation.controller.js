const centreFormationModel = require("../models/centreFormation.model");

module.exports.getAllCentres = async (req, res) => {
  try {
    const centres = await centreFormationModel.find().populate("responsableId", "-password");
    if (centres.length === 0) {
      throw new Error("No centres found");
    }
    res.status(200).json({ message: "Centres retrieved successfully", data: centres });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getCentreById = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id).populate("responsableId", "-password");
    if (!centre) {
      throw new Error("Centre not found");
    }
    res.status(200).json({ message: "Centre retrieved successfully", data: centre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createCentre = async (req, res) => {
  try {
    const { nom, adresse, description, telephone, responsableId } = req.body;
    const newCentre = new centreFormationModel({
      nom, adresse, description, telephone, responsableId,
    });
    await newCentre.save();
    res.status(201).json({ message: "Centre created successfully", data: newCentre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateCentre = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) {
      throw new Error("Centre not found");
    }
    const updatedCentre = await centreFormationModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: "Centre updated successfully", data: updatedCentre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteCentre = async (req, res) => {
  try {
    const deletedCentre = await centreFormationModel.findByIdAndDelete(req.params.id);
    if (!deletedCentre) {
      throw new Error("Centre not found");
    }
    res.status(200).json({ message: "Centre deleted successfully", data: deletedCentre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};