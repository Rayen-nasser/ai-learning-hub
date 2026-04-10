const formationModel = require("../models/formation.model");
const centreFormationModel = require("../models/centreFormation.model");
const categorieModel = require("../models/categorie.model");

module.exports.getAllFormations = async (req, res) => {
  try {
    const { titre, description, prixMin, prixMax, categorieId, centreId, dureeMin, dureeMax, search } = req.query;
    
    let query = {};

    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    } else {
      if (titre) query.titre = { $regex: titre, $options: 'i' };
      if (description) query.description = { $regex: description, $options: 'i' };
    }

    if (prixMin || prixMax) {
      query.prix = {};
      if (prixMin) query.prix.$gte = Number(prixMin);
      if (prixMax) query.prix.$lte = Number(prixMax);
    }

    if (categorieId) query.categorieId = categorieId;
    if (centreId) query.centreId = centreId;

    if (dureeMin || dureeMax) {
      query.duree = {};
      if (dureeMin) query.duree.$gte = Number(dureeMin);
      if (dureeMax) query.duree.$lte = Number(dureeMax);
    }

    const formations = await formationModel.find(query)
      .populate("centreId")
      .populate("categorieId");

    if (formations.length === 0) {
      return res.status(404).json({ message: "No formations found" });
    }
    res.status(200).json({ message: "Formations retrieved successfully", data: formations, total: formations.length });
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
      return res.status(404).json({ message: "Formation not found" });
    }
    res.status(200).json({ message: "Formation retrieved successfully", data: formation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createFormation = async (req, res) => {
  try {
    const { titre, description, prix, duree, centreId, categorieId } = req.body;

    if (!titre) {
      return res.status(400).json({ message: "Formation title is required" });
    }

    if (centreId) {
      const centre = await centreFormationModel.findById(centreId);
      if (!centre) {
        return res.status(400).json({ message: "Centre not found" });
      }
    }

    if (categorieId) {
      const categorie = await categorieModel.findById(categorieId);
      if (!categorie) {
        return res.status(400).json({ message: "Category not found" });
      }
    }

    const newFormation = new formationModel({
      titre,
      description,
      prix,
      duree,
      centreId,
      categorieId,
    });
    await newFormation.save();
    const populatedFormation = await formationModel.findById(newFormation._id)
      .populate("centreId")
      .populate("categorieId");
    res.status(201).json({ message: "Formation created successfully", data: populatedFormation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateFormation = async (req, res) => {
  try {
    const formation = await formationModel.findById(req.params.id).populate("centreId");
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    const isOwner = formation.centreId && formation.centreId.responsableId &&
      formation.centreId.responsableId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only update formations of your own centres." });
    }

    const { titre, description, prix, duree } = req.body;

    const updates = {};
    if (titre) updates.titre = titre;
    if (description !== undefined) updates.description = description;
    if (prix !== undefined) updates.prix = prix;
    if (duree !== undefined) updates.duree = duree;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedFormation = await formationModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("centreId").populate("categorieId");

    res.status(200).json({ message: "Formation updated successfully", data: updatedFormation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteFormation = async (req, res) => {
  try {
    const deletedFormation = await formationModel.findByIdAndDelete(req.params.id);
    if (!deletedFormation) {
      return res.status(404).json({ message: "Formation not found" });
    }
    res.status(200).json({ message: "Formation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
