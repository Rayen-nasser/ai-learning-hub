const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const maxage = 3 * 24 * 60 * 60;
const secretKey = process.env.JWT_SECRET;

const getBaseUrl = () => {
  return process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
};

const createToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN || maxage });
};

const POPULATE_CONFIG = [
  { path: "centreIds", model: "CentreFormation" }
];

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.loginAttempts;
  
  if (obj.user_image) {
    let path = obj.user_image;
    if (!path.startsWith('http') && !path.startsWith('/')) {
      path = '/' + path;
    }
    if (path.startsWith('http')) {
      obj.user_image = path;
    } else {
      obj.user_image = `${getBaseUrl()}${path}`;
    }
  }
  
  return obj;
};

const ALLOWED_UPDATE_FIELDS = [
  "nom", "prenom", "telephone", "user_image",
  "niveauEtude", "dateNaissance", "adresse",
  "specialite", "experience", "statut",
  "centreIds",
];

// ───── GET ALL USERS ─────
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate(POPULATE_CONFIG);
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
    const user = await userModel.findById(userId).populate(POPULATE_CONFIG);
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
      firstName, nom,
      lastName, prenom,
      email, password,
      phone, telephone,
      role,
      educationLevel, niveauEtude,
      birthDate, dateNaissance,
      address, adresse,
      specialty, specialite,
      experience,
      status, statut,
      centreIds,
    } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new userModel({
      nom: nom || firstName,
      prenom: prenom || lastName,
      email,
      password,
      telephone: telephone || phone,
      role: role || "apprenant",
      niveauEtude: niveauEtude || educationLevel,
      dateNaissance: dateNaissance || birthDate,
      adresse: adresse || address,
      specialite: specialite || specialty,
      experience,
      statut: statut || status,
      centreIds: Array.isArray(centreIds) ? centreIds : (centreIds ? [centreIds] : []),
    });
    await newUser.save();
    const populatedUser = await userModel.findById(newUser._id).populate(POPULATE_CONFIG);
    const token = createToken(newUser._id);
    res.status(201).json({ 
      message: "User created successfully", 
      token,
      data: sanitizeUser(populatedUser) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CREATE USER WITH IMAGE ─────
module.exports.createUserWithImage = async (req, res) => {
  try {
    const {
      firstName, nom,
      lastName, prenom,
      email, password,
      phone, telephone,
      role,
      educationLevel, niveauEtude,
      birthDate, dateNaissance,
      address, adresse,
      specialty, specialite,
      experience,
      status, statut,
      centreIds,
    } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new userModel({
      nom: nom || firstName,
      prenom: prenom || lastName,
      email,
      password,
      telephone: telephone || phone,
      role: role || "apprenant",
      user_image: req.file ? `${req.file.folder}/${req.file.filename}` : undefined,
      niveauEtude: niveauEtude || educationLevel,
      dateNaissance: dateNaissance || birthDate,
      adresse: adresse || address,
      specialite: specialite || specialty,
      experience,
      statut: statut || status,
      centreIds: Array.isArray(centreIds) ? centreIds : (centreIds ? [centreIds] : []),
    });
    await newUser.save();
    const populatedUser = await userModel.findById(newUser._id).populate(POPULATE_CONFIG);
    const token = createToken(newUser._id);
    res.status(201).json({ 
      message: "User created successfully", 
      token,
      data: sanitizeUser(populatedUser) 
    });
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
    ).populate(POPULATE_CONFIG);
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
    const populatedUser = await userModel.findById(user._id).populate(POPULATE_CONFIG);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxage * 1000 });
    res.status(200).json({ 
      message: "Login successful", 
      token,
      data: sanitizeUser(populatedUser) 
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
