const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const maxage = 3 * 24 * 60 * 60; // 3 days in seconds
const secretKey = "mySecretKey";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: maxage });
};

// ───── GET ALL USERS ─────
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    if (users.length === 0) {
      throw new Error("No users found");
    }
    res.status(200).json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET MY PROFILE ─────
module.exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user; // ✅ JWT middleware
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET USER BY ID ─────
module.exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE USER (tous les acteurs) ─────
module.exports.createUser = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, phone,
      role,
      // apprenant
      educationLevel, birthDate, address,
      // formateur
      specialty, experience, status, centreId,
      // responsableCF
      managedCentreId,
    } = req.body;

    const newUser = new userModel({
      nom: firstName,
      prenom: lastName,
      email,
      password,
      telephone: phone,
      role: role || "apprenant",
      // apprenant
      niveauEtude: educationLevel,
      dateNaissance: birthDate,
      adresse: address,
      // formateur
      specialite: specialty,
      experience,
      statut: status,
      centreId,
      // responsableCF
      centreGereId: managedCentreId,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE USER WITH IMAGE ─────
module.exports.createUserWithImage = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user_image = req.file.filename;
    const newUser = new userModel({ email, password, user_image });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── UPDATE USER ─────
module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      req.body, // ✅ corrigé
      { new: true },
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── DELETE USER ─────
module.exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── LOGIN ─────
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxage * 1000 });
    res.status(200).json({ message: "Login successful", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── LOGOUT ─────
module.exports.logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { httpOnly: true, maxAge: 1 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── FORGOT PASSWORD ─────
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    res.status(200).json({ message: "Forgot password endpoint" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};