const paiementModel = require("../models/paiement.model");
const inscriptionModel = require("../models/inscription.model");
const userModel = require("../models/user.model");

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
    res.status(200).json({ message: "Payment retrieved successfully", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createPaiement = async (req, res) => {
  try {
    const { inscriptionId, apprenantId, montant, methodePaiement } = req.body;

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

    const existingPaiement = await paiementModel.findOne({ inscriptionId });
    if (existingPaiement && existingPaiement.statut === "confirmé") {
      return res.status(400).json({ message: "Payment already made for this inscription" });
    }

    const newPaiement = new paiementModel({
      inscriptionId,
      apprenantId: apprenantId || inscription.apprenantId,
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
