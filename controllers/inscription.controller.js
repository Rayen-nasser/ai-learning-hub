const inscriptionModel = require("../models/inscription.model");

module.exports.getAllInscriptions = async (req, res) => {
  try {
    const inscriptions = await inscriptionModel.find()
      .populate("apprenantId", "-password")
      .populate("formationId");
    if (inscriptions.length === 0) {
      return res.status(404).json({ message: "No inscriptions found" });
    }
    res.status(200).json({ message: "Inscriptions retrieved successfully", data: inscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getInscriptionById = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id)
      .populate("apprenantId", "-password")
      .populate("formationId");
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }

    const isOwner = inscription.apprenantId._id.toString() === req.user._id.toString();
    const isAdminOrResponsable = ['admin', 'responsableCF'].includes(req.user.role);

    if (!isOwner && !isAdminOrResponsable) {
      return res.status(403).json({ message: "Access denied. You can only view your own inscriptions." });
    }

    res.status(200).json({ message: "Inscription retrieved successfully", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createInscription = async (req, res) => {
  try {
    const { formationId } = req.body;
    const apprenantId = req.user._id;

    if (!formationId) {
      return res.status(400).json({ message: "formationId is required" });
    }

    const existingInscription = await inscriptionModel.findOne({ apprenantId, formationId });
    if (existingInscription) {
      return res.status(400).json({ message: "You are already enrolled in this formation" });
    }

    const newInscription = new inscriptionModel({ apprenantId, formationId });
    await newInscription.save();
    const populatedInscription = await inscriptionModel.findById(newInscription._id)
      .populate("apprenantId", "-password")
      .populate("formationId");
    res.status(201).json({ message: "Inscription created successfully", data: populatedInscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.validerInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id);
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }
    if (inscription.statut === "acceptée") {
      return res.status(400).json({ message: "Inscription is already accepted" });
    }
    const updatedInscription = await inscriptionModel.findByIdAndUpdate(
      req.params.id,
      { statut: "acceptée", dateAcceptation: Date.now() },
      { new: true }
    ).populate("apprenantId", "-password").populate("formationId");
    res.status(200).json({ message: "Inscription validated successfully", data: updatedInscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.annulerInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id);
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }
    if (inscription.statut === "refusée") {
      return res.status(400).json({ message: "Inscription is already cancelled" });
    }
    const updatedInscription = await inscriptionModel.findByIdAndUpdate(
      req.params.id,
      { statut: "refusée" },
      { new: true }
    ).populate("apprenantId", "-password").populate("formationId");
    res.status(200).json({ message: "Inscription cancelled successfully", data: updatedInscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteInscription = async (req, res) => {
  try {
    const deletedInscription = await inscriptionModel.findByIdAndDelete(req.params.id);
    if (!deletedInscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }
    res.status(200).json({ message: "Inscription deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
