const favoriModel = require("../models/favori.model");

module.exports.getAllFavoris = async (req, res) => {
  try {
    const favoris = await favoriModel.find()
      .populate("apprenantId", "-password")
      .populate("cibleId");
    if (favoris.length === 0) {
      return res.status(404).json({ message: "No favoris found" });
    }
    res.status(200).json({ message: "Favoris retrieved successfully", data: favoris });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getFavorisByApprenant = async (req, res) => {
  try {
    const isOwner = req.params.apprenantId === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only view your own favorites." });
    }

    const favoris = await favoriModel.find({ apprenantId: req.params.apprenantId })
      .populate("apprenantId", "-password")
      .populate("cibleId");
    if (favoris.length === 0) {
      return res.status(404).json({ message: "No favoris found for this learner" });
    }
    res.status(200).json({ message: "Favoris retrieved successfully", data: favoris });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createFavori = async (req, res) => {
  try {
    const { cibleId, typeCible } = req.body;
    const apprenantId = req.user._id;

    if (!cibleId || !typeCible) {
      return res.status(400).json({ message: "cibleId and typeCible are required" });
    }

    const validTypes = ["formation", "lecon", "centreFormation"];
    if (!validTypes.includes(typeCible)) {
      return res.status(400).json({ message: `typeCible must be one of: ${validTypes.join(", ")}` });
    }

    const existingFavori = await favoriModel.findOne({ apprenantId, cibleId });
    if (existingFavori) {
      return res.status(400).json({ message: "This item is already in your favorites" });
    }

    const newFavori = new favoriModel({ apprenantId, cibleId, typeCible });
    await newFavori.save();
    const populatedFavori = await favoriModel.findById(newFavori._id)
      .populate("apprenantId", "-password")
      .populate("cibleId");
    res.status(201).json({ message: "Favori created successfully", data: populatedFavori });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteFavori = async (req, res) => {
  try {
    const favori = await favoriModel.findById(req.params.id);
    if (!favori) {
      return res.status(404).json({ message: "Favori not found" });
    }

    const isOwner = favori.apprenantId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only delete your own favorites." });
    }

    await favoriModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Favori deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
