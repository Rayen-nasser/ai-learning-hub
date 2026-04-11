const inscriptionModel = require("../models/inscription.model");
const formationModel = require("../models/formation.model");

const formatInscription = (i) => ({
  _id: i._id,
  statut: i.statut,
  dateAcceptation: i.dateAcceptation,
  createdAt: i.createdAt,
  apprenantId: i.apprenantId?._id,
  apprenantNom: i.apprenantId?.nom,
  apprenantPrenom: i.apprenantId?.prenom,
  formationId: i.formationId?._id,
  formationTitre: i.formationId?.titre,
});

module.exports.getAllInscriptions = async (req, res) => {
  try {
    const inscriptions = await inscriptionModel.find()
      .populate("apprenantId", "nom prenom")
      .populate("formationId", "titre");

    if (inscriptions.length === 0) {
      return res.status(404).json({ message: "No inscriptions found" });
    }

    const formattedInscriptions = inscriptions.map(formatInscription);
    res.status(200).json({ message: "Inscriptions retrieved successfully", data: formattedInscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getMyInscriptions = async (req, res) => {
  try {
    const inscriptions = await inscriptionModel.find({ apprenantId: req.user._id })
      .populate("apprenantId", "nom prenom")
      .populate("formationId", "titre");

    const formattedInscriptions = inscriptions.map(formatInscription);
    res.status(200).json({ message: "My inscriptions retrieved successfully", data: formattedInscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getInscriptionById = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id)
      .populate("apprenantId", "nom prenom")
      .populate("formationId", "titre");

    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }

    const isOwner = inscription.apprenantId?._id.toString() === req.user._id.toString();
    const isAdminOrResponsable = ['admin', 'responsableCF'].includes(req.user.role);

    if (!isOwner && !isAdminOrResponsable) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({ message: "Inscription retrieved successfully", data: formatInscription(inscription) });
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

    const formation = await formationModel.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    const statut = formation.prix === 0 ? "acceptée" : "en_attente";

    const newInscription = new inscriptionModel({ 
      apprenantId, 
      formationId,
      statut,
      dateAcceptation: statut === "acceptée" ? Date.now() : null,
    });
    await newInscription.save();

    const populatedInscription = await inscriptionModel.findById(newInscription._id)
      .populate("apprenantId", "nom prenom")
      .populate("formationId", "titre");

    res.status(201).json({ 
      message: statut === "acceptée" 
        ? "Enrolled successfully. You now have access to this formation." 
        : "Enrollment pending. Please complete payment to gain access.",
      data: formatInscription(populatedInscription),
    });
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
