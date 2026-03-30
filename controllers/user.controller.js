const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res) => {
  try {
    const {
      nom, prenom, email, password, telephone, role,
      niveauEtude, dateNaissance, adresse,
      specialite, experience, statut, centreId,
      centreGereId,
    } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new Error("Email déjà utilisé");
    }

    const newUser = new userModel({
      nom, prenom, email, password, telephone, role,
      niveauEtude, dateNaissance, adresse,
      specialite, experience, statut, centreId,
      centreGereId,
    });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.block) {
      throw new Error("Account blocked, contact administrator");
    }

    if (user.loginAttempts >= 5) {
      await userModel.findByIdAndUpdate(user._id, { block: true });
      throw new Error("Account blocked after too many attempts");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await userModel.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } });
      throw new Error(`Wrong password. Remaining attempts: ${5 - user.loginAttempts - 1}`);
    }

    await userModel.findByIdAndUpdate(user._id, { loginAttempts: 0 });

    res.status(200).json({ message: "Login successful", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getMyProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    if (users.length === 0) {
      throw new Error("No users found");
    }
    res.status(200).json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { password, ...rest } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(userId, rest, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updatedUser) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.blockUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { block: true, loginAttempts: 0 },
      { new: true }
    ).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User blocked successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.unblockUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { block: false, loginAttempts: 0 },
      { new: true }
    ).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User unblocked successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.params.id);
    if (!user) {
      throw new Error("User not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No image provided");
    }
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { photodeprofil: req.file.filename },
      { new: true }
    ).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "Photo updated successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("Email not found");
    }
    // TODO: envoyer un email de réinitialisation
    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};