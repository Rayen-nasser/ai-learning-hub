const avisModel = require("../models/avis.model");
const formationModel = require("../models/formation.model");

module.exports.getAllAvis = async (req, res) => {
  try {
    const avis = await avisModel.find()
      .populate("apprenantId", "-password")
      .populate("formationId");
    if (avis.length === 0) {
      return res.status(404).json({ message: "No reviews found" });
    }
    res.status(200).json({ message: "Reviews retrieved successfully", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAvisByFormation = async (req, res) => {
  try {
    const avis = await avisModel.find({ formationId: req.params.formationId })
      .populate("apprenantId", "-password")
      .populate("formationId");
    // We can just return an empty array if none, or 404
    res.status(200).json({ message: "Reviews retrieved successfully", data: avis });
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
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review retrieved successfully", data: avis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createAvis = async (req, res) => {
  try {
    const { formationId, note, commentaire } = req.body;
    const apprenantId = req.user._id;

    if (!formationId) {
      return res.status(400).json({ message: "formationId is required" });
    }

    if (note === undefined || note === null) {
      return res.status(400).json({ message: "Note is required" });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({ message: "Note must be between 1 and 5" });
    }

    const formation = await formationModel.findById(formationId);
    if (!formation) {
      return res.status(400).json({ message: "Formation not found" });
    }

    const existingAvis = await avisModel.findOne({ apprenantId, formationId });
    if (existingAvis) {
      return res.status(400).json({ message: "You have already reviewed this formation" });
    }

    const newAvis = new avisModel({ apprenantId, formationId, note, commentaire });
    await newAvis.save();
    const populatedAvis = await avisModel.findById(newAvis._id)
      .populate("apprenantId", "-password")
      .populate("formationId");
    res.status(201).json({ message: "Review created successfully", data: populatedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateAvis = async (req, res) => {
  try {
    const avis = await avisModel.findById(req.params.id);
    if (!avis) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = avis.apprenantId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only update your own reviews." });
    }

    const { note, commentaire } = req.body;

    const updates = {};
    if (note !== undefined) {
      if (note < 1 || note > 5) {
        return res.status(400).json({ message: "Note must be between 1 and 5" });
      }
      updates.note = note;
    }
    if (commentaire !== undefined) updates.commentaire = commentaire;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedAvis = await avisModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("apprenantId", "-password").populate("formationId");

    res.status(200).json({ message: "Review updated successfully", data: updatedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteAvis = async (req, res) => {
  try {
    const avis = await avisModel.findById(req.params.id);
    if (!avis) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = avis.apprenantId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only delete your own reviews." });
    }

    await avisModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
