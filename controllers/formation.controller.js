const mongoose = require("mongoose");
const formationModel = require("../models/formation.model");
const centreFormationModel = require("../models/centreFormation.model");
const categorieModel = require("../models/categorie.model");
const userModel = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/response");
const config = require("../config/config");

const sanitizeFormation = (f) => {
  const obj = f.toObject ? f.toObject() : { ...f };
  if (obj.image) {
    let path = obj.image;
    if (!path.startsWith('http') && !path.startsWith('/')) {
      path = '/' + path;
    }
    obj.image = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
  }
  return obj;
};

// @desc    Get all formations
// @route   GET /formations
// @access  Public
module.exports.getAllFormations = asyncHandler(async (req, res) => {
  const { titre, description, prixMin, prixMax, categorieId, centreId, dureeMin, dureeMax, search } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { titre: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  } else {
    if (titre)       query.titre       = { $regex: titre, $options: 'i' };
    if (description) query.description = { $regex: description, $options: 'i' };
  }

  if (prixMin || prixMax) {
    query.prix = {};
    if (prixMin) query.prix.$gte = Number(prixMin);
    if (prixMax) query.prix.$lte = Number(prixMax);
  }

  if (categorieId) query.categorieId = categorieId;
  if (centreId)    query.centreId    = centreId;

  if (dureeMin || dureeMax) {
    query.duree = {};
    if (dureeMin) query.duree.$gte = Number(dureeMin);
    if (dureeMax) query.duree.$lte = Number(dureeMax);
  }

  const formations = await formationModel
    .find(query)
    .populate("centreId")
    .populate("categorieId")
    .populate("formateurIds", "nom prenom email role user_image");

  const sanitizedFormations = formations.map(sanitizeFormation);
  
  return sendSuccess(res, sanitizedFormations, "Formations retrieved successfully");
});

// @desc    Get formation by ID
// @route   GET /formations/:id
// @access  Public
module.exports.getFormationById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, "Invalid formation ID format", 400);
  }

  const formation = await formationModel
    .findById(req.params.id)
    .populate("centreId")
    .populate("categorieId")
    .populate("formateurIds", "nom prenom email role user_image");

  if (!formation) {
    return sendError(res, "Formation not found", 404);
  }

  return sendSuccess(res, sanitizeFormation(formation), "Formation retrieved successfully");
});

// @desc    Create a new formation
// @route   POST /formations
// @access  Private (responsableCF, admin)
module.exports.createFormation = asyncHandler(async (req, res) => {
  const { titre, description, prix, duree, centreId, categorieId } = req.body;

  if (centreId) {
    const centre = await centreFormationModel.findById(centreId);
    if (!centre) return sendError(res, "Centre not found", 400);
    
    // Authorization check: Only owner or admin can add to this centre
    const isOwner = centre.responsableId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, "Access denied. You can only add formations to your own centres.", 403);
    }
  }

  if (categorieId) {
    const categorie = await categorieModel.findById(categorieId);
    if (!categorie) return sendError(res, "Category not found", 400);
  }

  const image = req.file ? `${req.file.folder}/${req.file.filename}` : undefined;

  const newFormation = new formationModel({ titre, description, prix, duree, centreId, categorieId, image });
  await newFormation.save();

  const populated = await formationModel
    .findById(newFormation._id)
    .populate("centreId")
    .populate("categorieId");

  return sendSuccess(res, sanitizeFormation(populated), "Formation created successfully", 201);
});

// @desc    Update a formation
// @route   PUT /formations/:id
// @access  Private (Owner, admin)
module.exports.updateFormation = asyncHandler(async (req, res) => {
  const formation = await formationModel.findById(req.params.id).populate("centreId");
  if (!formation) {
    return sendError(res, "Formation not found", 404);
  }

  const isOwner = formation.centreId?.responsableId?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return sendError(res, "Access denied. You can only update formations of your own centres.", 403);
  }

  const { titre, description, prix, duree } = req.body;
  const updates = {};
  if (titre)                 updates.titre       = titre;
  if (description !== undefined) updates.description = description;
  if (prix        !== undefined) updates.prix        = prix;
  if (duree       !== undefined) updates.duree       = duree;
  if (req.file) updates.image = `${req.file.folder}/${req.file.filename}`;

  if (Object.keys(updates).length === 0) {
    return sendError(res, "No fields to update", 400);
  }

  const updated = await formationModel
    .findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate("centreId")
    .populate("categorieId");

  return sendSuccess(res, sanitizeFormation(updated), "Formation updated successfully");
});

// @desc    Delete a formation
// @route   DELETE /formations/:id
// @access  Private (admin)
module.exports.deleteFormation = asyncHandler(async (req, res) => {
  const deleted = await formationModel.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, "Formation not found", 404);
  
  // TODO: Implement file cleanup here if needed
  
  return sendSuccess(res, null, "Formation deleted successfully");
});

// @desc    Assign formateurs to formation
// @route   POST /formations/:id/formateurs
// @access  Private (Owner, admin)
module.exports.assignFormateurs = asyncHandler(async (req, res) => {
  const formation = await formationModel.findById(req.params.id).populate("centreId");
  if (!formation) return sendError(res, "Formation not found", 404);

  const isOwner = formation.centreId?.responsableId?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return sendError(res, "Access denied. Only the centre owner or admin can assign formateurs.", 403);
  }

  const { formateurIds } = req.body;
  if (!formateurIds || !Array.isArray(formateurIds)) {
    return sendError(res, "formateurIds array is required", 400);
  }

  const formateurs = await userModel.find({ _id: { $in: formateurIds }, role: "formateur" });
  if (formateurs.length !== formateurIds.length) {
    return sendError(res, "Some IDs are not valid formateurs or have incorrect role", 400);
  }

  // Synchronize the array: Replace current formateurs with the new list
  formation.formateurIds = formateurIds;
  await formation.save();

  const updatedFormation = await formationModel.findById(req.params.id)
    .populate("centreId")
    .populate("categorieId")
    .populate("formateurIds", "nom prenom email role user_image");

  return sendSuccess(res, sanitizeFormation(updatedFormation), "Formateurs assigned successfully");
});

// @desc    Remove formateur from formation
// @route   DELETE /formations/:id/formateurs/:formateurId
// @access  Private (Owner, admin)
module.exports.removeFormateur = asyncHandler(async (req, res) => {
  const formation = await formationModel.findById(req.params.id).populate("centreId");
  if (!formation) return sendError(res, "Formation not found", 404);

  // Authorization check: Only centre owner or admin
  const isOwner = formation.centreId?.responsableId?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return sendError(res, "Access denied. Only the centre owner or admin can remove formateurs.", 403);
  }

  const targetId = req.params.formateurId;
  
  // Check if formateur is actually in the array
  const exists = formation.formateurIds.some(id => id.toString() === targetId);
  if (!exists) {
    return sendError(res, "Formateur not found in this formation", 404);
  }

  // Use Mongoose's pull method to remove the ID from the array
  formation.formateurIds.pull(targetId);
  await formation.save();

  const updatedFormation = await formationModel.findById(formation._id)
    .populate("centreId")
    .populate("categorieId")
    .populate("formateurIds", "nom prenom email role user_image");

  return sendSuccess(res, sanitizeFormation(updatedFormation), "Formateur removed successfully");
});

// @desc    Get formateurs of a formation
// @route   GET /formations/:id/formateurs
// @access  Private (Owner, admin)
module.exports.getFormateurs = asyncHandler(async (req, res) => {
  const formation = await formationModel.findById(req.params.id)
    .populate({
      path: "formateurIds",
      match: { role: "formateur" },
      select: "nom prenom email role user_image"
    });

  if (!formation) return sendError(res, "Formation not found", 404);

  const formateurs = formation.formateurIds.filter(f => f !== null);
  return sendSuccess(res, formateurs, "Formateurs retrieved successfully");
});

// @desc    Get all available formateurs
// @route   GET /formations/formateurs
// @access  Private (responsableCF, admin)
module.exports.getAvailableFormateurs = asyncHandler(async (req, res) => {
  const formateurs = await userModel.find({ role: "formateur" })
    .select("nom prenom email user_image");

  return sendSuccess(res, formateurs, "Available formateurs retrieved successfully");
});

// @desc    Get formations assigned to current formateur
// @route   GET /formations/my-assignments
// @access  Private (formateur)
module.exports.getMyAssignments = asyncHandler(async (req, res) => {
  if (req.user.role !== 'formateur') {
    return sendError(res, "Only formateurs can access this endpoint", 403);
  }

  const formations = await formationModel
    .find({ formateurIds: req.user._id })
    .populate("centreId", "nom")
    .populate("categorieId", "nom");

  const sanitizedFormations = formations.map(sanitizeFormation);
  return sendSuccess(res, sanitizedFormations, "My assignments retrieved successfully");
});