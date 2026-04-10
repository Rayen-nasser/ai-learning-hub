const avisModel = require("../models/avis.model");
const formationModel = require("../models/formation.model");

module.exports.getAllAvis = async (req, res) => {
  try {
    const avis = await avisModel.find()
      .populate("apprenantId", "_id nom prenom")
      .populate("formationId", "_id");

    if (avis.length === 0) {
      return res.status(404).json({ message: "No reviews found" });
    }

    const formattedAvis = avis.map(a => ({
      _id: a._id,
      note: a.note,
      commentaire: a.commentaire,
      createdAt: a.createdAt,
      apprenantId: a.apprenantId?._id,
      apprenantNom: a.apprenantId?.nom,
      apprenantPrenom: a.apprenantId?.prenom,
      formationId: a.formationId?._id,
    }));

    res.status(200).json({ message: "Reviews retrieved successfully", data: formattedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAvisByFormation = async (req, res) => {
  try {
    const avis = await avisModel.find({ formationId: req.params.formationId })
      .populate("apprenantId", "_id nom prenom")
      .populate("formationId", "_id");

    const formattedAvis = avis.map(a => ({
      _id: a._id,
      note: a.note,
      commentaire: a.commentaire,
      createdAt: a.createdAt,
      apprenantId: a.apprenantId?._id,
      apprenantNom: a.apprenantId?.nom,
      apprenantPrenom: a.apprenantId?.prenom,
      formationId: a.formationId?._id,
    }));

    res.status(200).json({ message: "Reviews retrieved successfully", data: formattedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.getAvisById = async (req, res) => {
  try {
    const avis = await avisModel.findById(req.params.id)
      .populate("apprenantId", "_id nom prenom")
      .populate("formationId", "_id");

    if (!avis) {
      return res.status(404).json({ message: "Review not found" });
    }

    const formattedAvis = {
      _id: avis._id,
      note: avis.note,
      commentaire: avis.commentaire,
      createdAt: avis.createdAt,
      apprenantId: avis.apprenantId?._id,
      apprenantNom: avis.apprenantId?.nom,
      apprenantPrenom: avis.apprenantId?.prenom,
      formationId: avis.formationId?._id,
    };

    res.status(200).json({ message: "Review retrieved successfully", data: formattedAvis });
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
      .populate("apprenantId", "_id nom prenom")
      .populate("formationId", "_id");

    const formattedAvis = {
      _id: populatedAvis._id,
      note: populatedAvis.note,
      commentaire: populatedAvis.commentaire,
      createdAt: populatedAvis.createdAt,
      apprenantId: populatedAvis.apprenantId?._id,
      apprenantNom: populatedAvis.apprenantId?.nom,
      apprenantPrenom: populatedAvis.apprenantId?.prenom,
      formationId: populatedAvis.formationId?._id,
    };

    res.status(201).json({ message: "Review created successfully", data: formattedAvis });
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
    ).populate("apprenantId", "_id nom prenom").populate("formationId", "_id");

    const formattedAvis = {
      _id: updatedAvis._id,
      note: updatedAvis.note,
      commentaire: updatedAvis.commentaire,
      createdAt: updatedAvis.createdAt,
      apprenantId: updatedAvis.apprenantId?._id,
      apprenantNom: updatedAvis.apprenantId?.nom,
      apprenantPrenom: updatedAvis.apprenantId?.prenom,
      formationId: updatedAvis.formationId?._id,
    };

    res.status(200).json({ message: "Review updated successfully", data: formattedAvis });
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
