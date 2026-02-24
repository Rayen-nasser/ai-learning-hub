const Learner = require("../models/learner.model");

module.exports.getAllLearners = async (req, res) => {
  try {
    const learners = await Learner.find().select("-password");
    res.status(200).json({ message: "Learners retrieved successfully", data: learners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getLearnerById = async (req, res) => {
  try {
    const learner = await Learner.findById(req.params.id).select("-password");
    if (!learner) return res.status(404).json({ error: "Learner not found" });
    res.status(200).json({ message: "Learner retrieved successfully", data: learner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createLearner = async (req, res) => {
  try {
    const { name, prenom, email, password, tel, age, location, photo } = req.body;
    const newLearner = await Learner.create({
      name, prenom, email, password, tel, age, location, photo,
      role: "apprenant",
    });
    res.status(201).json({ message: "Learner created successfully", data: newLearner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateLearner = async (req, res) => {
  try {
    const updated = await Learner.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select("-password");
    if (!updated) return res.status(404).json({ error: "Learner not found" });
    res.status(200).json({ message: "Learner updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteLearner = async (req, res) => {
  try {
    const deleted = await Learner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Learner not found" });
    res.status(200).json({ message: "Learner deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};