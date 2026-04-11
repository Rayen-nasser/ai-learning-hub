const paiementModel = require("../models/paiement.model");
const inscriptionModel = require("../models/inscription.model");
const formationModel = require("../models/formation.model");

const formatPaiement = (p) => ({
  _id: p._id,
  montant: p.montant,
  methodePaiement: p.methodePaiement,
  statut: p.statut,
  createdAt: p.createdAt,
  inscriptionId: p.inscriptionId?._id,
  formationId: p.inscriptionId?.formationId?._id || p.inscriptionId?.formationId,
  formationTitre: p.inscriptionId?.formationId?.titre,
  apprenantId: p.apprenantId?._id,
  apprenantNom: p.apprenantId?.nom,
  apprenantPrenom: p.apprenantId?.prenom,
});

module.exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await paiementModel.find()
      .populate("inscriptionId", "formationId")
      .populate("apprenantId", "nom prenom");

    if (paiements.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }

    const formattedPaiements = paiements.map(formatPaiement);
    res.status(200).json({ message: "Payments retrieved successfully", data: formattedPaiements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getMyPaiements = async (req, res) => {
  try {
    const paiements = await paiementModel.find({ apprenantId: req.user._id })
      .populate("inscriptionId", "formationId")
      .populate("apprenantId", "nom prenom");

    const formattedPaiements = paiements.map(formatPaiement);
    res.status(200).json({ message: "My payments retrieved successfully", data: formattedPaiements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getPaiementById = async (req, res) => {
  try {
    const paiement = await paiementModel.findById(req.params.id)
      .populate("inscriptionId", "formationId")
      .populate("apprenantId", "nom prenom");

    if (!paiement) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const isOwner = paiement.apprenantId?._id.toString() === req.user._id.toString();
    const isAdminOrResponsable = ['admin', 'responsableCF'].includes(req.user.role);

    if (!isOwner && !isAdminOrResponsable) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({ message: "Payment retrieved successfully", data: formatPaiement(paiement) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createPaiement = async (req, res) => {
  try {
    const { formationId, methodePaiement } = req.body;
    const apprenantId = req.user._id;

    if (!formationId) {
      return res.status(400).json({ message: "formationId is required" });
    }

    const formation = await formationModel.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    if (formation.prix === 0) {
      return res.status(400).json({ message: "This formation is free. No payment needed." });
    }

    const existingInscription = await inscriptionModel.findOne({ apprenantId, formationId });
    if (existingInscription && existingInscription.statut === "acceptée") {
      return res.status(400).json({ message: "You are already enrolled in this formation" });
    }

    let inscription;
    if (existingInscription) {
      if (existingInscription.statut === "acceptée") {
        return res.status(400).json({ message: "You are already enrolled in this formation" });
      }
      inscription = existingInscription;
    } else {
      inscription = new inscriptionModel({ 
        apprenantId, 
        formationId, 
        statut: "en_attente" 
      });
      await inscription.save();
    }

    const existingPaiement = await paiementModel.findOne({ inscriptionId: inscription._id });
    if (existingPaiement && existingPaiement.statut === "confirmé") {
      return res.status(400).json({ message: "Payment already completed for this inscription" });
    }

    const newPaiement = new paiementModel({
      inscriptionId: inscription._id,
      apprenantId,
      montant: formation.prix,
      methodePaiement: methodePaiement || "carte",
      statut: "en_attente",
    });
    await newPaiement.save();

    const populatedPaiement = await paiementModel.findById(newPaiement._id)
      .populate("inscriptionId", "formationId")
      .populate("apprenantId", "nom prenom");

    res.status(201).json({ 
      message: "Payment initiated. Please complete payment to confirm enrollment.",
      data: formatPaiement(populatedPaiement),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.confirmPaiement = async (req, res) => {
  try {
    const paiement = await paiementModel.findById(req.params.id).populate("inscriptionId");
    
    if (!paiement) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (paiement.statut === "confirmé") {
      return res.status(400).json({ message: "Payment already confirmed" });
    }

    const updatedPaiement = await paiementModel.findByIdAndUpdate(
      req.params.id,
      { statut: "confirmé" },
      { new: true }
    ).populate("inscriptionId", "formationId").populate("apprenantId", "nom prenom");

    await inscriptionModel.findByIdAndUpdate(
      paiement.inscriptionId._id,
      { statut: "acceptée", dateAcceptation: Date.now() }
    );

    res.status(200).json({ 
      message: "Payment confirmed. You now have access to the formation.",
      data: formatPaiement(updatedPaiement),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.cancelPaiement = async (req, res) => {
  try {
    const paiement = await paiementModel.findById(req.params.id);
    
    if (!paiement) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (paiement.statut === "confirmé") {
      return res.status(400).json({ message: "Cannot cancel a confirmed payment" });
    }

    await paiementModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Payment cancelled successfully" });
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
