const Admin = require("../models/admin.model");

module.exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json({ message: "Admins retrieved successfully", data: admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.status(200).json({ message: "Admin retrieved successfully", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createAdmin = async (req, res) => {
  try {
    const { name, prenom, email, password, tel, age, location, photo } = req.body;
    const newAdmin = await Admin.create({
      name, prenom, email, password, tel, age, location, photo,
      role: "admin",
    });
    res.status(201).json({ message: "Admin created successfully", data: newAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateAdmin = async (req, res) => {
  try {
    const updated = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select("-password");
    if (!updated) return res.status(404).json({ error: "Admin not found" });
    res.status(200).json({ message: "Admin updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteAdmin = async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Admin not found" });
    res.status(200).json({ message: "Admin deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};