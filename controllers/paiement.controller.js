const paiementModel = require("../models/paiement.model");
const inscriptionModel = require("../models/inscription.model");

module.exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await paiementModel.find()
      .populate("inscriptionId")
      .populate("apprenantId", "-password");
    if (paiements.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }
    res.status(200).json({ message: "Payments retrieved successfully", data: paiements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getPaiementById = async (req, res) => {
  try {
    const paiement = await paiementModel.findById(req.params.id)
      .populate("inscriptionId")
      .populate("apprenantId", "-password");
    if (!paiement) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const isOwner = paiement.apprenantId && paiement.apprenantId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only view your own payments." });
    }

    res.status(200).json({ message: "Payment retrieved successfully", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createPaiement = async (req, res) => {
  try {
    const { inscriptionId, montant, methodePaiement } = req.body;
    const apprenantId = req.user._id;

    if (!inscriptionId || !montant) {
      return res.status(400).json({ message: "inscriptionId and montant are required" });
    }

    if (montant <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const inscription = await inscriptionModel.findById(inscriptionId);
    if (!inscription) {
      return res.status(400).json({ message: "Inscription not found" });
    }

    if (inscription.statut !== "acceptée") {
      return res.status(400).json({ message: "Inscription must be accepted before payment" });
    }

    if (inscription.apprenantId.toString() !== apprenantId.toString()) {
      return res.status(403).json({ message: "You can only pay for your own inscriptions" });
    }

    const existingPaiement = await paiementModel.findOne({ inscriptionId });
    if (existingPaiement && existingPaiement.statut === "confirmé") {
      return res.status(400).json({ message: "Payment already made for this inscription" });
    }

    const newPaiement = new paiementModel({
      inscriptionId,
      apprenantId,
      montant,
      methodePaiement: methodePaiement || "carte",
    });
    await newPaiement.save();
    const populatedPaiement = await paiementModel.findById(newPaiement._id)
      .populate("inscriptionId")
      .populate("apprenantId", "-password");
    res.status(201).json({ message: "Payment created successfully", data: populatedPaiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.confirmerPaiement = async (req, res) => {
  try {
    const paiement = await paiementModel.findById(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (paiement.statut === "confirmé") {
      return res.status(400).json({ message: "Payment is already confirmed" });
    }
    const updatedPaiement = await paiementModel.findByIdAndUpdate(
      req.params.id,
      { statut: "confirmé" },
      { new: true }
    ).populate("inscriptionId").populate("apprenantId", "-password");
    res.status(200).json({ message: "Payment confirmed successfully", data: updatedPaiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deletePaiement = async (req, res) => {
  try {
    const deletedPaiement = await paiementModel.findByIdAndDelete(req.params.id);
    if (!deletedPaiement) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
