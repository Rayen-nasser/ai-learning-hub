const Admin = require("../models/admin.model");

module.exports.getAll = async (req, res) => {
  try {
    const admins = await Admin.find().populate("userId", "name prenom email");
    res.status(200).json({ message: "Admins récupérés avec succès", data: admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate("userId", "name prenom email");
    if (!admin) throw new Error("Admin non trouvé");
    res.status(200).json({ message: "Admin récupéré avec succès", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { userId, niveau, permissions } = req.body;
    const admin = new Admin({ userId, niveau, permissions });
    await admin.save();
    res.status(201).json({ message: "Admin créé avec succès", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { niveau, permissions } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { niveau, permissions },
      { new: true }
    );
    if (!admin) throw new Error("Admin non trouvé");
    res.status(200).json({ message: "Admin mis à jour avec succès", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) throw new Error("Admin non trouvé");
    res.status(200).json({ message: "Admin supprimé avec succès", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.changerPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    );
    if (!admin) throw new Error("Admin non trouvé");
    res.status(200).json({ message: "Permissions mises à jour avec succès", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.mettreAJourConnexion = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { derniereConnexion: Date.now() },
      { new: true }
    );
    if (!admin) throw new Error("Admin non trouvé");
    res.status(200).json({ message: "Dernière connexion mise à jour", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};