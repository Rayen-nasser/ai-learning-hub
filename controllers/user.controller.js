const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

// ───── GET ALL USERS ─────
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    if (users.length === 0) throw new Error("No users found");
    res.status(200).json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET USER BY ID ─────
module.exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");
    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE USER ─────
module.exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, educationLevel, birthDate, address } = req.body;
    const newUser = new userModel({
      nom: firstName,
      prenom: lastName,
      email,
      password,
      telephone: phone,
      niveauEtude: educationLevel,
      dateNaissance: birthDate,
      adresse: address,
      role: "user",
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

    if (!req.file) {
      throw new Error("No image provided");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new Error("Email déjà utilisé");
    }

    const newUser = new userModel({
      email,
      password,
      user_image: req.file.filename,
    });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE ADMIN ─────
module.exports.createAdmin = async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    const newUser = new userModel({
      email,
      password,
      telephone: phone,
      role: "admin",
    });
    await newUser.save();
    res.status(201).json({ message: "Admin created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE TRAINER ─────
module.exports.createTrainer = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, specialty, experience, status, centreId } = req.body;
    const newUser = new userModel({
      nom: firstName,
      prenom: lastName,
      email,
      password,
      telephone: phone,
      specialite: specialty,
      experience,
      statut: status,
      centreId,
      role: "formateur",
    });
    await newUser.save();
    res.status(201).json({ message: "Trainer created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE CENTER MANAGER ─────
module.exports.createCenterManager = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, managedCentreId } = req.body;
    const newUser = new userModel({
      nom: firstName,
      prenom: lastName,
      email,
      password,
      telephone: phone,
      centreGereId: managedCentreId,
      role: "responsableCF",
    });
    await newUser.save();
    res.status(201).json({ message: "Center Manager created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── UPDATE USER ─────
module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await userModel.findByIdAndUpdate(userId, req.body, { new: true });
    if (!updatedUser) throw new Error("User not found");
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
    if (!deletedUser) throw new Error("User not found");
    res.status(200).json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── FORGOT PASSWORD ─────
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    res.status(200).json({ message: "Forgot password endpoint", email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── LOGIN ─────
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new Error("Incorrect email");

    if (user.block) throw new Error("Account blocked, contact administrator");

    if (user.loginAttempts >= 5) {
      await userModel.findByIdAndUpdate(user._id, { block: true });
      throw new Error("Account blocked after too many attempts");
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      await userModel.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } });
      throw new Error(`Invalid password. Remaining attempts: ${5 - user.loginAttempts - 1}`);
    }

    await userModel.findByIdAndUpdate(user._id, { loginAttempts: 0 });

    res.status(200).json({ message: "Login successful", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── LOGOUT ─────
module.exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};