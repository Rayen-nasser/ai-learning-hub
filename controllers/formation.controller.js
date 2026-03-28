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
    const role = req.session.user.role;

    if (role !== "admin" && role !== "responsableCF") {
      throw new Error("Access denied, admin or responsableCF only");
    }

    const { titre, description, prix, centreId, categorieId, duree } = req.body;

    // responsableCF ne peut créer que dans son propre centre
    if (role === "responsableCF") {
      const centre = await centreFormationModel.findById(centreId);
      if (!centre) {
        throw new Error("Centre not found");
      }
      if (centre.responsableId.toString() !== req.session.user._id.toString()) {
        throw new Error("Access denied, you can only create formations in your own centre");
      }
    }

    const newFormation = new formationModel({ titre, description, prix, centreId, categorieId, duree });
    await newFormation.save();
    res.status(201).json({ message: "Formation created successfully", data: newFormation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateFormation = async (req, res) => {
  try {
    const role = req.session.user.role;

    if (role !== "admin" && role !== "responsableCF") {
      throw new Error("Access denied, admin or responsableCF only");
    }

    const formation = await formationModel.findById(req.params.id);
    if (!formation) {
      throw new Error("Formation not found");
    }

    // responsableCF ne peut modifier que les formations de son propre centre
    if (role === "responsableCF") {
      const centre = await centreFormationModel.findById(formation.centreId);
      if (!centre) {
        throw new Error("Centre not found");
      }
      if (centre.responsableId.toString() !== req.session.user._id.toString()) {
        throw new Error("Access denied, you can only update formations in your own centre");
      }
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
    const role = req.session.user.role;

    if (role !== "admin" && role !== "responsableCF") {
      throw new Error("Access denied, admin or responsableCF only");
    }

    const formation = await formationModel.findById(req.params.id);
    if (!formation) {
      throw new Error("Formation not found");
    }

    // responsableCF ne peut supprimer que les formations de son propre centre
    if (role === "responsableCF") {
      const centre = await centreFormationModel.findById(formation.centreId);
      if (!centre) {
        throw new Error("Centre not found");
      }
      if (centre.responsableId.toString() !== req.session.user._id.toString()) {
        throw new Error("Access denied, you can only delete formations in your own centre");
      }
    }

    const deletedFormation = await formationModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Formation deleted successfully", data: deletedFormation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};