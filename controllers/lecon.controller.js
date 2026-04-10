const leconModel = require("../models/lecon.model");
const inscriptionModel = require("../models/inscription.model");
const formationModel = require("../models/formation.model");
const userModel = require("../models/user.model");
const leconContentModel = require("../models/leconContent.model");

const checkAccess = async (lecon, user) => {
  const leconObj = lecon.toObject ? lecon.toObject() : lecon;
  const leconId = leconObj._id;

  if (user.role === 'admin') {
    return { hasAccess: true, role: 'admin' };
  }

  const isFormateur = leconObj.formateurId && leconObj.formateurId.toString() === user._id.toString();
  if (isFormateur) {
    return { hasAccess: true, role: 'formateur' };
  }

  const isAccessible = leconObj.estAccessible === true;

  if (leconObj.formationId) {
    const formationId = leconObj.formationId._id || leconObj.formationId;
    const inscription = await inscriptionModel.findOne({
      apprenantId: user._id,
      formationId: formationId,
      statut: "acceptée"
    });
    if (inscription) {
      return { hasAccess: true, role: 'apprenant' };
    }
  }

  return { hasAccess: isAccessible, role: user.role };
};

module.exports.getLecons = async (req, res) => {
  try {
    const { formationId } = req.query;
    const user = req.user;

    let query = {};

    if (formationId) {
      const formation = await formationModel.findById(formationId);
      if (!formation) {
        return res.status(404).json({ message: "Formation not found" });
      }
      query.formationId = formationId;
    }

    const lecons = await leconModel.find(query)
      .populate("formationId")
      .populate("formateurId", "-password")
      .sort({ order: 1, createdAt: 1 });

    if (lecons.length === 0) {
      return res.status(404).json({ message: "No lessons found" });
    }

    const enrichedLecons = await Promise.all(lecons.map(async (lecon) => {
      const leconObj = lecon.toObject ? lecon.toObject() : lecon;
      const access = await checkAccess(lecon, user);
      const contentCount = await leconContentModel.countDocuments({ leconId: lecon._id });

      return {
        ...leconObj,
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
    const lecon = await leconModel.findById(req.params.id)
      .populate("formationId")
      .populate("formateurId", "-password");

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

    res.status(200).json({ message: "Lesson retrieved successfully", data: leconObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createLecon = async (req, res) => {
  try {
    const { titre, description, contenu, duree, formationId, formateurId, estAccessible, order } = req.body;

    if (!titre) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    if (formationId) {
      const formation = await formationModel.findById(formationId);
      if (!formation) {
        return res.status(400).json({ message: "Formation not found" });
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
      contenu,
      duree,
      formationId,
      formateurId: finalFormateurId,
      estAccessible: estAccessible || false,
      order: order || 0,
    });

    await newLecon.save();
    const populatedLecon = await leconModel.findById(newLecon._id)
      .populate("formationId")
      .populate("formateurId", "-password");

    res.status(201).json({ message: "Lesson created successfully", data: populatedLecon });
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

    const isOwner = lecon.formateurId && lecon.formateurId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only update your own lessons." });
    }

    const { titre, description, contenu, duree, estAccessible, order } = req.body;

    const updates = {};
    if (titre !== undefined) updates.titre = titre;
    if (description !== undefined) updates.description = description;
    if (contenu !== undefined) updates.contenu = contenu;
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
    ).populate("formationId").populate("formateurId", "-password");

    res.status(200).json({ message: "Lesson updated successfully", data: updatedLecon });
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

    const isOwner = lecon.formateurId && lecon.formateurId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. Only the instructor or admin can delete this lesson." });
    }

    await leconContentModel.deleteMany({ leconId: req.params.id });
    await leconModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Lesson and its contents deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
