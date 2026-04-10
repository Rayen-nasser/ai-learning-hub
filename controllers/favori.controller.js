const favoriModel = require("../models/favori.model");

const formatFavori = (f, cibleTitre = null) => ({
  _id: f._id,
  typeCible: f.typeCible,
  createdAt: f.createdAt,
  apprenantId: f.apprenantId ? {
    _id: f.apprenantId._id,
    nom: f.apprenantId.nom,
    prenom: f.apprenantId.prenom,
    user_image: f.apprenantId.user_image,
  } : null,
  cibleId: f.cibleId?._id || f.cibleId,
  cibleTitre,
});

const getCibleTitre = async (typeCible, cibleId) => {
  if (!typeCible || !cibleId) return null;
  try {
    if (typeCible === "formation") {
      const formation = await require("../models/formation.model").findById(cibleId).select("titre");
      return formation?.titre;
    } else if (typeCible === "lecon") {
      const lecon = await require("../models/lecon.model").findById(cibleId).select("titre");
      return lecon?.titre;
    } else if (typeCible === "centreFormation") {
      const centre = await require("../models/centreFormation.model").findById(cibleId).select("nom");
      return centre?.nom;
    }
  } catch (err) {
    return null;
  }
  return null;
};

module.exports.getAllFavoris = async (req, res) => {
  try {
    const favoris = await favoriModel.find()
      .populate("apprenantId", "_id nom prenom user_image");

    const formattedFavoris = [];
    for (const f of favoris) {
      const cibleTitre = await getCibleTitre(f.typeCible, f.cibleId);
      formattedFavoris.push(formatFavori(f, cibleTitre));
    }

    if (formattedFavoris.length === 0) {
      return res.status(404).json({ message: "No favoris found" });
    }

    res.status(200).json({ message: "Favoris retrieved successfully", data: formattedFavoris });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getMyFavorites = async (req, res) => {
  try {
    const favoris = await favoriModel.find({ apprenantId: req.user._id })
      .populate("apprenantId", "_id nom prenom user_image");

    const formattedFavoris = [];
    for (const f of favoris) {
      const cibleTitre = await getCibleTitre(f.typeCible, f.cibleId);
      formattedFavoris.push(formatFavori(f, cibleTitre));
    }

    res.status(200).json({ message: "My favoris retrieved successfully", data: formattedFavoris });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getFavoriById = async (req, res) => {
  try {
    const favori = await favoriModel.findById(req.params.id)
      .populate("apprenantId", "_id nom prenom user_image");

    if (!favori) {
      return res.status(404).json({ message: "Favori not found" });
    }

    const isOwner = favori.apprenantId?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const cibleTitre = await getCibleTitre(favori.typeCible, favori.cibleId);
    res.status(200).json({ message: "Favori retrieved successfully", data: formatFavori(favori, cibleTitre) });
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
      .populate("apprenantId", "_id nom prenom user_image");

    const cibleTitre = await getCibleTitre(typeCible, cibleId);

    res.status(201).json({
      message: "Favori created successfully",
      data: formatFavori(populatedFavori, cibleTitre),
    });
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
      return res.status(403).json({ message: "Access denied." });
    }

    await favoriModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Favori deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
