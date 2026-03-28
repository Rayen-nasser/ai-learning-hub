const inscriptionModel = require("../models/inscription.model");

module.exports.getAllInscriptions = async (req, res) => {
  try {
    const inscriptions = await inscriptionModel.find()
      .populate("apprenantId", "-password")
      .populate("formationId");
    if (inscriptions.length === 0) {
      throw new Error("No inscriptions found");
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
      throw new Error("Inscription not found");
    }
    res.status(200).json({ message: "Inscription retrieved successfully", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createInscription = async (req, res) => {
  try {
    const { apprenantId, formationId } = req.body;
    const newInscription = new inscriptionModel({ apprenantId, formationId });
    await newInscription.save();
    res.status(201).json({ message: "Inscription created successfully", data: newInscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.validerInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findByIdAndUpdate(
      req.params.id,
      { statue: "acceptée", dateAcceptation: Date.now() },
      { new: true }
    );
    if (!inscription) {
      throw new Error("Inscription not found");
    }
    res.status(200).json({ message: "Inscription validated successfully", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.annulerInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findByIdAndUpdate(
      req.params.id,
      { statue: "refusée" },
      { new: true }
    );
    if (!inscription) {
      throw new Error("Inscription not found");
    }
    res.status(200).json({ message: "Inscription cancelled successfully", data: inscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteInscription = async (req, res) => {
  try {
    const deletedInscription = await inscriptionModel.findByIdAndDelete(req.params.id);
    if (!deletedInscription) {
      throw new Error("Inscription not found");
    }
    res.status(200).json({ message: "Inscription deleted successfully", data: deletedInscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};