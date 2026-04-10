const leconModel = require("../models/lecon.model");
const inscriptionModel = require("../models/inscription.model");
const formationModel = require("../models/formation.model");
const userModel = require("../models/user.model");
const leconContentModel = require("../models/leconContent.model");

const sanitizeLeconContent = (contents, hasAccess) => {
  return contents.map(content => {
    const sanitized = {
      _id: content._id,
      leconId: content.leconId,
      type: content.type,
      title: content.title,
      description: content.description,
      order: content.order,
      hasAccess: hasAccess,
    };

    if (hasAccess) {
      sanitized.url = content.url;
      sanitized.sourceType = content.sourceType;
      sanitized.fileName = content.fileName;
      sanitized.fileSize = content.fileSize;
      sanitized.mimeType = content.mimeType;
      sanitized.linkTitle = content.linkTitle;
      sanitized.linkUrl = content.linkUrl;
      sanitized.linkDescription = content.linkDescription;
      sanitized.passingGrade = content.passingGrade;
      sanitized.questions = content.questions;
    }

    return sanitized;
  });
};

const checkLeconAccess = async (lecon, user) => {
  const isFormateur = lecon.formateurId && 
    (lecon.formateurId._id || lecon.formateurId).toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  const isAccessible = lecon.estAccessible === true;

  let isEnrolled = false;
  if (lecon.formationId && user.role === 'apprenant') {
    const formationId = lecon.formationId._id || lecon.formationId;
    const inscription = await inscriptionModel.findOne({
      apprenantId: user._id,
      formationId: formationId,
      statut: "acceptée"
    });
    isEnrolled = !!inscription;
  }

  return {
    hasAccess: isFormateur || isAdmin || isAccessible || isEnrolled,
    isFormateur,
    isAdmin,
    isAccessible,
    isEnrolled
  };
};

module.exports.getAllLecons = async (req, res) => {
  try {
    const user = req.user;
    
    let query = {};

    if (user.role === 'admin') {
      query = {};
    } else if (user.role === 'formateur') {
      query = { formateurId: user._id };
    } else {
      const inscriptions = await inscriptionModel.find({ 
        apprenantId: user._id, 
        statut: "acceptée" 
      }).select('formationId');
      const enrolledFormationIds = inscriptions.map(i => i.formationId);
      query = { 
        $or: [
          { formationId: { $in: enrolledFormationIds } },
          { estAccessible: true }
        ]
      };
    }

    const lecons = await leconModel.find(query)
      .populate("formationId")
      .populate("formateurId", "-password");

    if (lecons.length === 0) {
      return res.status(404).json({ message: "No lessons found" });
    }

    const enrichedLecons = await Promise.all(lecons.map(async (lecon) => {
      const leconObj = lecon.toObject ? lecon.toObject() : lecon;
      const access = await checkLeconAccess(lecon, user);
      
      const contents = await leconContentModel.find({ leconId: lecon._id }).sort({ order: 1 });
      leconObj.contents = sanitizeLeconContent(contents, access.hasAccess);
      
      return leconObj;
    }));

    res.status(200).json({ message: "Lessons retrieved successfully", data: enrichedLecons });
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
    const access = await checkLeconAccess(lecon, user);

    const leconObj = lecon.toObject ? lecon.toObject() : lecon;

    if (!access.hasAccess) {
      delete leconObj.contenu;
    }

    const contents = await leconContentModel.find({ leconId: lecon._id }).sort({ order: 1 });
    leconObj.contents = sanitizeLeconContent(contents, access.hasAccess);

    if (!access.hasAccess) {
      leconObj.hasAccess = false;
      leconObj.accessMessage = "Enroll in this formation to access the full content";
    }

    res.status(200).json({ message: "Lesson retrieved successfully", data: leconObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createLecon = async (req, res) => {
  try {
    const { titre, description, contenu, duree, formationId, formateurId, estAccessible } = req.body;

    if (!titre) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    if (formationId) {
      const formation = await formationModel.findById(formationId);
      if (!formation) {
        return res.status(400).json({ message: "Formation not found" });
      }
    }

    const finalFormateurId = req.user.role === 'formateur' ? req.user._id : (formateurId || req.user._id);

    if (formateurId && req.user.role !== 'admin') {
      const formateur = await userModel.findById(formateurId);
      if (!formateur) {
        return res.status(400).json({ message: "Formateur not found" });
      }
    }

    const newLecon = new leconModel({
      titre,
      description,
      contenu,
      duree,
      formationId,
      formateurId: finalFormateurId,
      estAccessible: estAccessible || false,
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

    const { titre, description, contenu, duree, estAccessible } = req.body;

    const updates = {};
    if (titre) updates.titre = titre;
    if (description !== undefined) updates.description = description;
    if (contenu !== undefined) updates.contenu = contenu;
    if (duree !== undefined) updates.duree = duree;
    if (estAccessible !== undefined) updates.estAccessible = estAccessible;

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
    const deletedLecon = await leconModel.findByIdAndDelete(req.params.id);
    if (!deletedLecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await leconContentModel.deleteMany({ leconId: req.params.id });

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
