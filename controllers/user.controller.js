const userModel = require("../models/user.model");

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    if (users.length === 0) throw new Error("No users found");
    res.status(200).json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) throw new Error("User not found");
    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new userModel({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUserAdmin = async (req, res) => {
  try {
    const { name, prenom, email, password, tel, niveau, permissions } = req.body;

    // 1. Créer le User avec le bon rôle
    const newUser = new userModel({ name, prenom, email, password, tel, role: "admin" });
    await newUser.save();

    // 2. Créer automatiquement le profil Admin lié
    const Admin = require("../models/admin.model");
    const profil = new Admin({
      userId: newUser._id,
      niveau: niveau || "admin",
      permissions: permissions || ["read", "write", "delete"],
    });
    await profil.save();

    res.status(201).json({
      message: "Admin créé avec succès",
      data: { user: newUser, profil },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUserFormateur = async (req, res) => {
  try {
    const { name, prenom, email, password, tel, specialite, biographie, experience } = req.body;

    // 1. Créer le User
    const newUser = new userModel({ name, prenom, email, password, tel, role: "formateur" });
    await newUser.save();

    // 2. Créer automatiquement le profil Formateur lié
    const Formateur = require("../models/formateur.model");
    const profil = new Formateur({
      userId: newUser._id,
      specialite: specialite || "",
      biographie: biographie || "",
      experience: experience || "",
    });
    await profil.save();

    res.status(201).json({
      message: "Formateur créé avec succès",
      data: { user: newUser, profil },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUserApprenant = async (req, res) => {
  try {
    const { name, prenom, email, password, tel, niveauEtude, dateNaissance, adresse } = req.body;

    // 1. Créer le User
    const newUser = new userModel({ name, prenom, email, password, tel, role: "apprenant" });
    await newUser.save();

    // 2. Créer automatiquement le profil Apprenant lié
    const Apprenant = require("../models/apprenant.model");
    const profil = new Apprenant({
      userId: newUser._id,
      niveauEtude: niveauEtude || "bac",
      dateNaissance: dateNaissance || null,
      telephone: tel,
      adresse: adresse || "",
    });
    await profil.save();

    res.status(201).json({
      message: "Apprenant créé avec succès",
      data: { user: newUser, profil },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ NOUVEAU : création d'un DirecteurCentreFormation (User + profil)
module.exports.createUserDirecteur = async (req, res) => {
  try {
    const { name, prenom, email, password, tel, nomCentre, adresse, siteWeb } = req.body;

    // 1. Créer le User avec le bon rôle
    const newUser = new userModel({
      name, prenom, email, password, tel,
      role: "directeurCentreFormation",
    });
    await newUser.save();

    // 2. Créer automatiquement le profil DirecteurCentreFormation lié
    const DirecteurCentreFormation = require("../models/directeurCentreFormation.model");
    const profil = new DirecteurCentreFormation({
      userId: newUser._id,
      nomCentre,
      adresse,
      telephone: tel,
      siteWeb,
    });
    await profil.save();

    res.status(201).json({
      message: "DirecteurCentreFormation créé avec succès",
      data: { user: newUser, profil },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { name, prenom, age, location, photo } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { name, prenom, age, location, photo },
      { new: true }
    );
    if (!updatedUser) throw new Error("User not found");
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) throw new Error("User not found");
    res.status(200).json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};