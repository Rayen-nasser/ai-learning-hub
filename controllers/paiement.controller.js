const paiementModel = require("../models/paiement.model");

module.exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await paiementModel.find()
      .populate("inscriptionId")
      .populate("apprenantId", "-password");
    if (paiements.length === 0) {
      throw new Error("No paiements found");
    }
    res.status(200).json({ message: "Paiements retrieved successfully", data: paiements });
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
      throw new Error("Paiement not found");
    }
    res.status(200).json({ message: "Paiement retrieved successfully", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createPaiement = async (req, res) => {
  try {
    const { inscriptionId, apprenantId, montant, methodePaiement } = req.body;
    const newPaiement = new paiementModel({ inscriptionId, apprenantId, montant, methodePaiement });
    await newPaiement.save();
    res.status(201).json({ message: "Paiement created successfully", data: newPaiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.confirmerPaiement = async (req, res) => {
  try {
    const paiement = await paiementModel.findByIdAndUpdate(
      req.params.id,
      { statut: "confirmé" },
      { new: true }
    );
    if (!paiement) {
      throw new Error("Paiement not found");
    }
    res.status(200).json({ message: "Paiement confirmed successfully", data: paiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deletePaiement = async (req, res) => {
  try {
    const deletedPaiement = await paiementModel.findByIdAndDelete(req.params.id);
    if (!deletedPaiement) {
      throw new Error("Paiement not found");
    }
    res.status(200).json({ message: "Paiement deleted successfully", data: deletedPaiement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};