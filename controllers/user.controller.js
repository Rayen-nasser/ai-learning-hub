const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const maxage = 3 * 24 * 60 * 60;
const secretKey = process.env.JWT_SECRET;

const createToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN || maxage });
};

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.loginAttempts;
  return obj;
};

const ALLOWED_UPDATE_FIELDS = [
  "nom", "prenom", "telephone", "user_image",
  "niveauEtude", "dateNaissance", "adresse",
  "specialite", "experience", "statut",
];

// ───── GET ALL USERS ─────
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    const sanitizedUsers = users.map(sanitizeUser);
    res.status(200).json({ message: "Users retrieved successfully", data: sanitizedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET MY PROFILE ─────
module.exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
    res.status(200).json({ message: "User retrieved successfully", data: sanitizeUser(user) });
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
      educationLevel, birthDate, address,
      specialty, experience, status, centreId,
      managedCentreId,
    } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new userModel({
      nom: firstName,
      prenom: lastName,
      email,
      password,
      telephone: phone,
      role: role || "apprenant",
      niveauEtude: educationLevel,
      dateNaissance: birthDate,
      adresse: address,
      specialite: specialty,
      experience,
      statut: status,
      centreId,
      centreGereId: managedCentreId,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", data: sanitizeUser(newUser) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE USER WITH IMAGE ─────
module.exports.createUserWithImage = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, phone,
      role,
      educationLevel, birthDate, address,
      specialty, experience, status, centreId,
      managedCentreId,
    } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new userModel({
      nom: firstName,
      prenom: lastName,
      email,
      password,
      telephone: phone,
      role: role || "apprenant",
      user_image: req.file ? req.file.filename : undefined,
      niveauEtude: educationLevel,
      dateNaissance: birthDate,
      adresse: address,
      specialite: specialty,
      experience,
      statut: status,
      centreId,
      centreGereId: managedCentreId,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", data: sanitizeUser(newUser) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── UPDATE USER ─────
module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    if (currentUser._id.toString() !== userId && currentUser.role !== "admin") {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.file) {
      updates.user_image = `${req.file.folder}/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updates,
      { new: true },
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", data: sanitizeUser(updatedUser) });
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
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", data: sanitizeUser(deletedUser) });
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
    res.status(200).json({ 
      message: "Login successful", 
      token,
      data: sanitizeUser(user) 
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
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
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }
    const resetToken = jwt.sign(
      { id: user._id, type: "password-reset" },
      secretKey,
      { expiresIn: "1h" }
    );
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    console.log(`Password reset token for ${email}: ${resetToken}`);
    res.status(200).json({
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── RESET PASSWORD ─────
module.exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CHANGE PASSWORD (authenticated) ─────
module.exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user._id);
    const isMatch = await userModel.login(user.email, currentPassword);
    user.password = newPassword;
    await user.save();
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxage * 1000 });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
