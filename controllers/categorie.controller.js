const categorieModel = require("../models/categorie.model");
const { sendSuccess, sendError } = require("../utils/response");
const config = require("../config/config");

const sanitizeCategorie = (cat) => {
  const obj = cat.toObject ? cat.toObject() : { ...cat };
  if (obj.image) {
    let path = obj.image;
    if (!path.startsWith('http') && !path.startsWith('/')) {
      path = '/' + path;
    }
    obj.image = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
  }
  return obj;
};

module.exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categorieModel.find();
    const sanitized = categories.map(sanitizeCategorie);
    return sendSuccess(res, sanitized, "Categories retrieved successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await categorieModel.findById(req.params.id);
    if (!categorie) {
      return sendError(res, "Category not found", 404);
    }
    return sendSuccess(res, sanitizeCategorie(categorie), "Category retrieved successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    if (!nom) {
      return sendError(res, "Category name is required", 400);
    }

    const existingCategory = await categorieModel.findOne({ nom });
    if (existingCategory) {
      return sendError(res, "Category with this name already exists", 400);
    }

    const image = req.file ? `${req.file.folder}/${req.file.filename}` : req.body.image;
    const ownerId = req.user._id;

    const newCategorie = new categorieModel({ nom, description, image, ownerId });
    await newCategorie.save();
    return sendSuccess(res, sanitizeCategorie(newCategorie), "Category created successfully", 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.updateCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    const categorie = await categorieModel.findById(req.params.id);
    if (!categorie) {
      return sendError(res, "Category not found", 404);
    }

    // Authorization check: Only owner or admin
    const isOwner = categorie.ownerId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, "Access denied. Only the creator or admin can update this category.", 403);
    }

    const updates = {};
    if (nom) updates.nom = nom;
    if (description !== undefined) updates.description = description;
    
    if (req.file) {
      updates.image = `${req.file.folder}/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      updates.image = req.body.image;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, "No fields to update", 400);
    }

    const updatedCategorie = await categorieModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    return sendSuccess(res, sanitizeCategorie(updatedCategorie), "Category updated successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await categorieModel.findById(req.params.id);
    if (!categorie) {
      return sendError(res, "Category not found", 404);
    }

    // Authorization check: Only owner or admin
    const isOwner = categorie.ownerId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, "Access denied. Only the creator or admin can delete this category.", 403);
    }

    await categorieModel.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, "Category deleted successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};
