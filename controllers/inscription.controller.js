const inscriptionModel = require("../models/inscription.model");
const formationModel = require("../models/formation.model");
const centreFormationModel = require("../models/centreFormation.model");

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
    // Get formations owned by this ResponsableCF
    const centres = await centreFormationModel.find({ responsableId: req.user._id }).select("_id");
    const centreIds = centres.map(c => c._id);
    const formations = await formationModel.find({ centreId: { $in: centreIds } }).select("_id");
    const formationIds = formations.map(f => f._id);

    // Find inscriptions only for these formations
    const inscriptions = await inscriptionModel.find({ formationId: { $in: formationIds } })
      .populate("apprenantId", "nom prenom")
      .populate("formationId", "titre");

    if (inscriptions.length === 0) {
      return res.status(404).json({ message: "No inscriptions found for your centre" });
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

    const statut = formation.prix === 0 ? "acceptee" : "en_attente";

    const newInscription = new inscriptionModel({ 
      apprenantId, 
      formationId,
      statut,
      dateAcceptation: statut === "acceptee" ? Date.now() : null,
    });
    await newInscription.save();

    const populatedInscription = await inscriptionModel.findById(newInscription._id)
      .populate("apprenantId", "nom prenom")
      .populate("formationId", "titre");

    res.status(201).json({ 
      message: statut === "acceptee"
        ? "Enrolled successfully. You now have access to this formation." 
        : "Enrollment pending. Please complete payment to gain access.",
      data: formatInscription(populatedInscription),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteInscription = async (req, res) => {
  // Inscriptions cannot be deleted - maintains audit trail
  return res.status(403).json({ message: "Inscriptions cannot be deleted. Contact support if needed." });
};

// @desc    User cancels own pending inscription
// @route   PUT /inscriptions/cancel/:id
// @access  Private (Owner only)
module.exports.cancelInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id);
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }

    // Only owner can cancel
    const isOwner = inscription.apprenantId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: "You can only cancel your own inscriptions" });
    }

    // Can only cancel if still pending
    if (inscription.statut !== "en_attente") {
      return res.status(400).json({ message: "Cannot cancel an accepted or rejected inscription" });
    }

    await inscriptionModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Inscription cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    ResponsableCF rejects inscription for their centre
// @route   PUT /inscriptions/reject/:id
// @access  Private (ResponsableCF only)
module.exports.rejectInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id)
      .populate("formationId");
    
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }

    // Check if the ResponsableCF owns this centre
    const formation = await formationModel.findById(inscription.formationId._id).populate("centreId");
    if (!formation?.centreId?.responsableId) {
      return res.status(403).json({ message: "This formation has no responsable assigned" });
    }

    const isResponsable = formation.centreId.responsableId.toString() === req.user._id.toString();
    if (!isResponsable) {
      return res.status(403).json({ message: "You can only reject inscriptions for your own centre's formations" });
    }

    // Update to rejected (soft delete - maintains audit trail)
    await inscriptionModel.findByIdAndUpdate(req.params.id, {
      statut: "refusee",
      dateAcceptation: Date.now()
    });

    res.status(200).json({ message: "Inscription rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    ResponsableCF reactivates rejected inscription for their centre
// @route   PUT /inscriptions/reactivate/:id
// @access  Private (ResponsableCF only)
module.exports.reactivateInscription = async (req, res) => {
  try {
    const inscription = await inscriptionModel.findById(req.params.id)
      .populate("formationId");
    
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found" });
    }

    // Check if the ResponsableCF owns this centre
    const formation = await formationModel.findById(inscription.formationId._id).populate("centreId");
    if (!formation?.centreId?.responsableId) {
      return res.status(403).json({ message: "This formation has no responsable assigned" });
    }

    const isResponsable = formation.centreId.responsableId.toString() === req.user._id.toString();
    if (!isResponsable) {
      return res.status(403).json({ message: "You can only reactivate inscriptions for your own centre's formations" });
    }

    // Can only reactivate if rejected
    if (inscription.statut !== "refusee") {
      return res.status(400).json({ message: "Can only reactivate rejected inscriptions" });
    }

    // Update back to accepted
    await inscriptionModel.findByIdAndUpdate(req.params.id, {
      statut: "acceptee",
      dateAcceptation: Date.now()
    });

    res.status(200).json({ message: "Inscription reactivated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
