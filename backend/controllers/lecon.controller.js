const mongoose = require("mongoose");
const leconModel = require("../models/lecon.model");
const inscriptionModel = require("../models/inscription.model");
const paiementModel = require("../models/paiement.model");
const formationModel = require("../models/formation.model");
const userModel = require("../models/user.model");
const leconContentModel = require("../models/leconContent.model");

const isFormateurAssigned = async (userId, formationId) => {
  const formation = await formationModel.findById(formationId);
  if (!formation) return false;
  return formation.formateurIds.some(id => id.toString() === userId.toString());
};

const checkAccess = async (lecon, user) => {
  const leconObj = lecon.toObject ? lecon.toObject() : lecon;

  if (user.role === 'admin') {
    return { hasAccess: true, role: 'admin' };
  }

  const isFormateur = leconObj.formateurId && leconObj.formateurId.toString() === user._id.toString();
  if (isFormateur) {
    return { hasAccess: true, role: 'formateur' };
  }

  if (user.role === 'formateur' && leconObj.formationId) {
    const formationId = leconObj.formationId._id || leconObj.formationId;
    const assigned = await isFormateurAssigned(user._id, formationId);
    if (assigned) {
      return { hasAccess: true, role: 'formateur' };
    }
  }

  const isAccessible = leconObj.estAccessible === true;

  if (leconObj.formationId) {
    const formationId = leconObj.formationId._id || leconObj.formationId;

    // Check if user has accepted inscription
    const inscription = await inscriptionModel.findOne({
      apprenantId: user._id,
      formationId: formationId,
      statut: "acceptee"
    });

    if (inscription) {
      // Check if payment is confirmed
      const paiement = await paiementModel.findOne({
        inscriptionId: inscription._id,
        statut: "confirme"
      });

      if (paiement) {
        return { hasAccess: true, role: 'apprenant' };
      }
    }
  }

  return { hasAccess: isAccessible, role: user.role };
};

const checkFormateurCanModify = async (lecon, user) => {
  if (user.role === 'admin') return true;

  const leconObj = lecon.toObject ? lecon.toObject() : lecon;

  if (user.role === 'formateur') {
    const isOwner = leconObj.formateurId && leconObj.formateurId.toString() === user._id.toString();
    if (isOwner) return true;

    if (leconObj.formationId) {
      const formationId = leconObj.formationId._id || leconObj.formationId;
      return await isFormateurAssigned(user._id, formationId);
    }
  }

  return false;
};

module.exports.getLecons = async (req, res) => {
  try {
    const { formationId } = req.query;
    const user = req.user;

    let query = {};

    if (formationId) {
      if (!mongoose.Types.ObjectId.isValid(formationId)) {
        return res.status(400).json({ message: "Invalid formationId format" });
      }
      const formation = await formationModel.findById(formationId);
      if (!formation) {
        return res.status(404).json({ message: "Formation not found" });
      }
      query.formationId = formationId;
    }

    const lecons = await leconModel.find(query)
      .populate("formationId", "titre description prix duree")
      .populate("formateurId", "nom prenom")
      .sort({ order: 1, createdAt: 1 });

    if (lecons.length === 0) {
      return res.status(404).json({ message: "No lessons found" });
    }

    const enrichedLecons = await Promise.all(lecons.map(async (lecon) => {
      const leconObj = lecon.toObject ? lecon.toObject() : lecon;
      const access = await checkAccess(lecon, user);
      const contentCount = await leconContentModel.countDocuments({ leconId: lecon._id });

      return {
        _id: leconObj._id,
        titre: leconObj.titre,
        description: leconObj.description,
        duree: leconObj.duree,
        order: leconObj.order,
        estAccessible: leconObj.estAccessible,
        formation: leconObj.formationId,
        formateur: leconObj.formateurId,
        hasAccess: access.hasAccess,
        contentCount,
      };
    }));

    res.status(200).json({
      message: "Lessons retrieved successfully",
      data: enrichedLecons,
      total: enrichedLecons.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getLeconById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid lesson ID format" });
    }
    const lecon = await leconModel.findById(req.params.id)
      .populate("formationId", "titre description prix duree")
      .populate("formateurId", "nom prenom");

    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const user = req.user;
    const access = await checkAccess(lecon, user);
    const leconObj = lecon.toObject ? lecon.toObject() : lecon;

    if (!access.hasAccess) {
      return res.status(403).json({
        message: "Access denied. You must be enrolled in the formation or the lesson must be accessible."
      });
    }

    res.status(200).json({
      message: "Lesson retrieved successfully",
      data: {
        _id: leconObj._id,
        titre: leconObj.titre,
        description: leconObj.description,
        duree: leconObj.duree,
        order: leconObj.order,
        formation: leconObj.formationId,
        formateur: leconObj.formateurId,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createLecon = async (req, res) => {
  try {
    const { titre, description, duree, formationId, formateurId, estAccessible, order } = req.body;

    if (!titre) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    if (formationId) {
      const formation = await formationModel.findById(formationId);
      if (!formation) {
        return res.status(400).json({ message: "Formation not found" });
      }

      if (req.user.role === 'formateur') {
        const assigned = await isFormateurAssigned(req.user._id, formationId);
        if (!assigned) {
          return res.status(403).json({ message: "You are not assigned to this formation" });
        }
      }
    }

    let finalFormateurId = req.user._id;
    if (req.user.role === 'formateur') {
      finalFormateurId = req.user._id;
    } else if (req.user.role === 'admin' && formateurId) {
      finalFormateurId = formateurId;
    }

    const newLecon = new leconModel({
      titre,
      description,
      duree,
      formationId,
      formateurId: finalFormateurId,
      estAccessible: estAccessible || false,
      order: order || 0,
    });

    await newLecon.save();
    const populatedLecon = await leconModel.findById(newLecon._id)
      .populate("formationId", "titre description prix duree")
      .populate("formateurId", "nom prenom");

    res.status(201).json({ message: "Lesson created successfully", data: {
      _id: populatedLecon._id,
      titre: populatedLecon.titre,
      description: populatedLecon.description,
      duree: populatedLecon.duree,
      order: populatedLecon.order,
      formation: populatedLecon.formationId,
      formateur: populatedLecon.formateurId,
    }});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateLecon = async (req, res) => {
  try {
    const lecon = await leconModel.findById(req.params.id);
    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const canModify = await checkFormateurCanModify(lecon, req.user);
    if (!canModify) {
      return res.status(403).json({ message: "Access denied. You can only update lessons of formations you're assigned to." });
    }

    const { titre, description, duree, estAccessible, order } = req.body;

    const updates = {};
    if (titre !== undefined) updates.titre = titre;
    if (description !== undefined) updates.description = description;
    if (duree !== undefined) updates.duree = duree;
    if (estAccessible !== undefined) updates.estAccessible = estAccessible;
    if (order !== undefined) updates.order = order;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedLecon = await leconModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("formationId", "titre description prix duree").populate("formateurId", "nom prenom");

    res.status(200).json({ message: "Lesson updated successfully", data: {
      _id: updatedLecon._id,
      titre: updatedLecon.titre,
      description: updatedLecon.description,
      duree: updatedLecon.duree,
      order: updatedLecon.order,
      formation: updatedLecon.formationId,
      formateur: updatedLecon.formateurId,
    }});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteLecon = async (req, res) => {
  try {
    const lecon = await leconModel.findById(req.params.id);
    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const canModify = await checkFormateurCanModify(lecon, req.user);
    if (!canModify) {
      return res.status(403).json({ message: "Access denied. You can only delete lessons of formations you're assigned to." });
    }

    await leconContentModel.deleteMany({ leconId: req.params.id });
    await leconModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Lesson and its contents deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAIExplanation = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, action, contentId } = req.body;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lesson ID format" });
    }

    const lecon = await leconModel.findById(id);
    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Security: Check if student has access to this lesson
    const access = await checkAccess(lecon, user);
    if (!access.hasAccess) {
      return res.status(403).json({ message: "Access denied. You must be enrolled to use the AI assistant." });
    }

    // Call n8n Webhook
    const n8nWebhookUrl = process.env.N8N_STUDY_BUDDY_WEBHOOK_URL || "http://localhost:5678/webhook/study-buddy";
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leconId: id,
        question: question || "",
        action: action || "explain",
        contentId: contentId || null,
        sessionId: `${user._id}_${id}`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n error: ${errorText}`);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("AI Assistant Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "The AI assistant is currently unavailable. Please try again later.",
      details: error.message 
    });
  }
};
