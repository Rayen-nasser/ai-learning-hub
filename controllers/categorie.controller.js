const categorieModel = require("../models/categorie.model");

module.exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categorieModel.find();
    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }
    res.status(200).json({ message: "Categories retrieved successfully", data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await categorieModel.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category retrieved successfully", data: categorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createCategorie = async (req, res) => {
  try {
    const { nom, description, image } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await categorieModel.findOne({ nom });
    if (existingCategory) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const newCategorie = new categorieModel({ nom, description, image });
    await newCategorie.save();
    res.status(201).json({ message: "Category created successfully", data: newCategorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateCategorie = async (req, res) => {
  try {
    const { nom, description, image } = req.body;

    const updates = {};
    if (nom) updates.nom = nom;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedCategorie = await categorieModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedCategorie) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category updated successfully", data: updatedCategorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteCategorie = async (req, res) => {
  try {
    const deletedCategorie = await categorieModel.findByIdAndDelete(req.params.id);
    if (!deletedCategorie) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
