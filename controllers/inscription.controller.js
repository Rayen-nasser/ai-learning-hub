const inscriptionModel = require("../models/inscription.model");

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

    const newInscription = new inscriptionModel({ apprenantId, formationId });
    await newInscription.save();

    const populatedInscription = await inscriptionModel.findById(newInscription._id)
      .populate("apprenantId", "nom prenom")
      .populate("formationId", "titre");

    res.status(201).json({ message: "Inscription created successfully", data: formatInscription(populatedInscription) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.acceptInscription = async (req, res) => {
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
    ).populate("apprenantId", "nom prenom").populate("formationId", "titre");

    res.status(200).json({ message: "Inscription accepted successfully", data: formatInscription(updatedInscription) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.rejectInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id);
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }
    if (inscription.statut === "refusée") {
      return res.status(400).json({ message: "Inscription is already rejected" });
    }

    const updatedInscription = await inscriptionModel.findByIdAndUpdate(
      req.params.id,
      { statut: "refusée" },
      { new: true }
    ).populate("apprenantId", "nom prenom").populate("formationId", "titre");

    res.status(200).json({ message: "Inscription rejected successfully", data: formatInscription(updatedInscription) });
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
