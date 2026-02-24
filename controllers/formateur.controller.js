const Formateur = require("../models/formateur.model");

module.exports.getAllFormateurs = async (req, res) => {
  try {
    const formateurs = await Formateur.find().select("-password");
    res.status(200).json({ message: "Formateurs retrieved successfully", data: formateurs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getFormateurById = async (req, res) => {
  try {
    const formateur = await Formateur.findById(req.params.id).select("-password");
    if (!formateur) return res.status(404).json({ error: "Formateur not found" });
    res.status(200).json({ message: "Formateur retrieved successfully", data: formateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createFormateur = async (req, res) => {
  try {
    const { name, prenom, email, password, tel, age, location, photo } = req.body;
    const newFormateur = await Formateur.create({
      name, prenom, email, password, tel, age, location, photo,
      role: "formateur",
    });
    res.status(201).json({ message: "Formateur created successfully", data: newFormateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateFormateur = async (req, res) => {
  try {
    const updated = await Formateur.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select("-password");
    if (!updated) return res.status(404).json({ error: "Formateur not found" });
    res.status(200).json({ message: "Formateur updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteFormateur = async (req, res) => {
  try {
    const deleted = await Formateur.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Formateur not found" });
    res.status(200).json({ message: "Formateur deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};