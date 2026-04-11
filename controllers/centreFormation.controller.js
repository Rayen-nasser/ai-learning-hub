const centreFormationModel = require("../models/centreFormation.model");
const userModel = require("../models/user.model");

module.exports.getAllCentres = async (req, res) => {
  try {
    const centres = await centreFormationModel.find().populate("responsableId", "-password");
    if (centres.length === 0) {
      return res.status(404).json({ message: "No centres found" });
    }
    res.status(200).json({ message: "Centres retrieved successfully", data: centres });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET MY CENTRES (responsableCF) ─────
module.exports.getMyCentres = async (req, res) => {
  try {
    const centres = await centreFormationModel
      .find({ responsableId: req.user._id })
      .populate("responsableId", "-password");
    res.status(200).json({ message: "My centres retrieved successfully", data: centres });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET FORMATEUR CENTRES ─────
module.exports.getFormateurCentres = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const user = await userModel.findById(userId).populate({ path: "centreIds", model: "CentreFormation", populate: { path: "responsableId", select: "-password" } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Formateur centres retrieved successfully", data: user.centreIds || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getCentreById = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id).populate("responsableId", "-password");
    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }
    res.status(200).json({ message: "Centre retrieved successfully", data: centre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createCentre = async (req, res) => {
  try {
    const { nom, adresse, description, telephone, responsableId, logo } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Centre name is required" });
    }

    const finalResponsableId = responsableId || req.user._id;

    const responsable = await userModel.findById(finalResponsableId);
    if (!responsable) {
      return res.status(400).json({ message: "Responsable not found" });
    }
    if (!['responsableCF', 'admin'].includes(responsable.role)) {
      return res.status(400).json({ message: "Responsable must have role responsableCF or admin" });
    }

    const newCentre = new centreFormationModel({
      nom,
      adresse,
      description,
      telephone,
      responsableId: finalResponsableId,
      logo,
    });
    await newCentre.save();
    const populatedCentre = await centreFormationModel.findById(newCentre._id)
      .populate("responsableId", "-password");
    res.status(201).json({ message: "Centre created successfully", data: populatedCentre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateCentre = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    const isOwner = centre.responsableId && centre.responsableId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only update your own centres." });
    }

    const { nom, adresse, description, telephone, logo } = req.body;

    const updates = {};
    if (nom) updates.nom = nom;
    if (adresse !== undefined) updates.adresse = adresse;
    if (description !== undefined) updates.description = description;
    if (telephone !== undefined) updates.telephone = telephone;
    if (logo !== undefined) updates.logo = logo;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedCentre = await centreFormationModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("responsableId", "-password");

    res.status(200).json({ message: "Centre updated successfully", data: updatedCentre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteCentre = async (req, res) => {
  try {
    const deletedCentre = await centreFormationModel.findByIdAndDelete(req.params.id);
    if (!deletedCentre) {
      return res.status(404).json({ message: "Centre not found" });
    }
    res.status(200).json({ message: "Centre deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
