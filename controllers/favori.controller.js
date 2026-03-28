const favoriModel = require("../models/favori.model");

module.exports.getAllFavoris = async (req, res) => {
  try {
    const favoris = await favoriModel.find().populate("apprenantId", "-password");
    if (favoris.length === 0) {
      throw new Error("No favoris found");
    }
    res.status(200).json({ message: "Favoris retrieved successfully", data: favoris });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getFavorisByApprenant = async (req, res) => {
  try {
    const favoris = await favoriModel.find({ apprenantId: req.params.apprenantId })
      .populate("apprenantId", "-password");
    if (favoris.length === 0) {
      throw new Error("No favoris found");
    }
    res.status(200).json({ message: "Favoris retrieved successfully", data: favoris });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createFavori = async (req, res) => {
  try {
    const { apprenantId, cibleId, typeCible } = req.body;
    const newFavori = new favoriModel({ apprenantId, cibleId, typeCible });
    await newFavori.save();
    res.status(201).json({ message: "Favori created successfully", data: newFavori });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteFavori = async (req, res) => {
  try {
    const deletedFavori = await favoriModel.findByIdAndDelete(req.params.id);
    if (!deletedFavori) {
      throw new Error("Favori not found");
    }
    res.status(200).json({ message: "Favori deleted successfully", data: deletedFavori });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};