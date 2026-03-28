const categorieModel = require("../models/categorie.model");

module.exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categorieModel.find();
    if (categories.length === 0) {
      throw new Error("No categories found");
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
      throw new Error("Categorie not found");
    }
    res.status(200).json({ message: "Categorie retrieved successfully", data: categorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;
    const newCategorie = new categorieModel({ nom, description });
    await newCategorie.save();
    res.status(201).json({ message: "Categorie created successfully", data: newCategorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateCategorie = async (req, res) => {
  try {
    const updatedCategorie = await categorieModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategorie) {
      throw new Error("Categorie not found");
    }
    res.status(200).json({ message: "Categorie updated successfully", data: updatedCategorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteCategorie = async (req, res) => {
  try {
    const deletedCategorie = await categorieModel.findByIdAndDelete(req.params.id);
    if (!deletedCategorie) {
      throw new Error("Categorie not found");
    }
    res.status(200).json({ message: "Categorie deleted successfully", data: deletedCategorie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};