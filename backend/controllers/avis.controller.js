const avisModel = require("../models/avis.model");
const formationModel = require("../models/formation.model");
const inscriptionModel = require("../models/inscription.model");

const formatAvis = (a) => ({
  _id: a._id,
  note: a.note,
  commentaire: a.commentaire,
  createdAt: a.createdAt,
  formationId: a.formationId?._id,
  apprenantId: a.apprenantId ? {
    _id: a.apprenantId._id,
    nom: a.apprenantId.nom,
    prenom: a.apprenantId.prenom,
    user_image: a.apprenantId.user_image,
  } : null,
});

module.exports.getAllAvis = async (req, res) => {
  try {
    const avis = await avisModel.find()
      .populate("apprenantId", "_id nom prenom user_image")
      .populate("formationId", "_id");

    if (avis.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const formattedAvis = avis.map(formatAvis);
    res.status(200).json({ data: formattedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAvisByFormation = async (req, res) => {
  try {
    const avis = await avisModel.find({ formationId: req.params.formationId })
      .populate("apprenantId", "_id nom prenom user_image")
      .populate("formationId", "_id");

    const formattedAvis = avis.map(formatAvis);
    res.status(200).json({ data: formattedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getMyAvis = async (req, res) => {
  try {
    const avis = await avisModel.find({ apprenantId: req.user._id })
      .populate("apprenantId", "_id nom prenom user_image")
      .populate("formationId", "titre");

    const formattedAvis = avis.map(a => ({
      ...formatAvis(a),
      formationTitre: a.formationId?.titre,
    }));

    res.status(200).json({ data: formattedAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAvisById = async (req, res) => {
  try {
    const avis = await avisModel.findById(req.params.id)
      .populate("apprenantId", "_id nom prenom user_image")
      .populate("formationId", "titre");

    if (!avis) {
      return res.status(404).json({ message: "Review not found" });
    }

    const formattedAvis = {
      ...formatAvis(avis),
      formationTitre: avis.formationId?.titre,
    };

    res.status(200).json({ data: formattedAvis });
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

    if (!note || note < 1 || note > 5) {
      return res.status(400).json({ message: "Note must be between 1 and 5" });
    }

    const formation = await formationModel.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    const inscription = await inscriptionModel.findOne({
      apprenantId,
      formationId,
      statut: "acceptee"
    });
    if (!inscription) {
      return res.status(403).json({ message: "You must be enrolled to review this formation" });
    }

    const existingAvis = await avisModel.findOne({ apprenantId, formationId });
    if (existingAvis) {
      return res.status(400).json({ message: "You have already reviewed this formation" });
    }

    const newAvis = new avisModel({ apprenantId, formationId, note, commentaire });
    await newAvis.save();

    const populatedAvis = await avisModel.findById(newAvis._id)
      .populate("apprenantId", "_id nom prenom user_image")
      .populate("formationId", "titre");

    const formattedAvis = {
      ...formatAvis(populatedAvis),
      formationTitre: populatedAvis.formationId?.titre,
    };

    res.status(201).json({ message: "Review created successfully", data: formattedAvis });

    // Notify formateurs
    try {
      const { createNotification } = require("../utils/notification");
      const formationPopulated = await formationModel.findById(formationId).select("titre formateurIds");
      
      const notifyPromises = formationPopulated.formateurIds.map(formateurId => 
        createNotification({
          userId: formateurId,
          type: "new_review",
          title: "Nouvel avis reçu",
          message: `${req.user.prenom} ${req.user.nom} a laissé une note de ${note}/5 sur votre formation "${formationPopulated.titre}".`,
          relatedId: formationId,
          relatedModel: "Formation"
        })
      );
      await Promise.all(notifyPromises);
    } catch (notifyError) {
      console.error("Failed to send review notification:", notifyError);
    }
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
      return res.status(403).json({ message: "Access denied" });
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
    ).populate("apprenantId", "_id nom prenom user_image")
      .populate("formationId", "titre");

    const formattedAvis = {
      ...formatAvis(updatedAvis),
      formationTitre: updatedAvis.formationId?.titre,
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
      return res.status(403).json({ message: "Access denied" });
    }

    await avisModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
