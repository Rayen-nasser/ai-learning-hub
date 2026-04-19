const mongoose = require("mongoose");
const paiementModel = require("../models/paiement.model");
const inscriptionModel = require("../models/inscription.model");
const formationModel = require("../models/formation.model");
const userModel = require("../models/user.model");
const centreFormationModel = require("../models/centreFormation.model");
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/response");
const { sendPaymentPendingNotification, sendPaymentConfirmedNotification } = require("../services/email.service");
const { createNotification } = require("./notification.controller");

const formatPaiement = (p, formation) => {
  const formationObj = formation || (p.inscriptionId?.formationId?._id ? p.inscriptionId.formationId : null);
  
  return {
    _id: p._id,
    montant: p.montant,
    methodePaiement: p.methodePaiement,
    statut: p.statut,
    createdAt: p.createdAt,
    inscriptionId: p.inscriptionId?._id,
    inscriptionStatut: p.inscriptionId?.statut,
    formationId: formationObj?._id || p.inscriptionId?.formationId,
    formation: formationObj ? {
      titre: formationObj.titre,
      description: formationObj.description,
      prix: formationObj.prix,
      duree: formationObj.duree,
      centreId: formationObj.centreId?._id || formationObj.centreId,
      centreNom: formationObj.centreId?.nom,
      categorieId: formationObj.categorieId?._id || formationObj.categorieId,
      categorieNom: formationObj.categorieId?.nom,
      image: formationObj.image,
    } : null,
    apprenantId: p.apprenantId?._id,
    apprenantNom: p.apprenantId?.nom,
    apprenantPrenom: p.apprenantId?.prenom,
  };
};

// @desc    Get all payments
// @route   GET /paiements
// @access  Private (Admin)
module.exports.getAllPaiements = asyncHandler(async (req, res) => {
  const paiements = await paiementModel.find()
    .populate("inscriptionId")
    .populate("apprenantId", "nom prenom");

  if (paiements.length === 0) {
    return sendError(res, "No payments found", 404);
  }

  const formationIds = paiements
    .map(p => p.inscriptionId?.formationId)
    .filter(id => id);

  const formations = await formationModel.find({ _id: { $in: formationIds } })
    .populate("centreId", "nom")
    .populate("categorieId", "nom");

  const formationMap = {};
  formations.forEach(f => { formationMap[f._id.toString()] = f; });

  const formattedPaiements = paiements.map(p => {
    const formation = formationMap[p.inscriptionId?.formationId?.toString()];
    return formatPaiement(p, formation);
  });

  return sendSuccess(res, formattedPaiements, "Payments retrieved successfully");
});

// @desc    Get my payments
// @route   GET /paiements/my-paiements
// @access  Private (Apprenant)
module.exports.getMyPaiements = asyncHandler(async (req, res) => {
  const paiements = await paiementModel.find({ apprenantId: req.user._id })
    .populate("inscriptionId")
    .populate("apprenantId", "nom prenom");

  const formationIds = paiements
    .map(p => p.inscriptionId?.formationId)
    .filter(id => id);

  const formations = await formationModel.find({ _id: { $in: formationIds } })
    .populate("centreId", "nom")
    .populate("categorieId", "nom");

  const formationMap = {};
  formations.forEach(f => { formationMap[f._id.toString()] = f; });

  const formattedPaiements = paiements.map(p => {
    const formation = formationMap[p.inscriptionId?.formationId?.toString()];
    return formatPaiement(p, formation);
  });

  return sendSuccess(res, formattedPaiements, "My payments retrieved successfully");
});

// @desc    Get payment by ID
// @route   GET /paiements/:id
// @access  Private (Owner, Admin, ResponsableCF)
module.exports.getPaiementById = asyncHandler(async (req, res) => {
  if (req.params.id === 'my') {
    return this.getMyPaiements(req, res);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, "Invalid payment ID format", 400);
  }

  const paiement = await paiementModel.findById(req.params.id)
    .populate("inscriptionId")
    .populate("apprenantId", "nom prenom");

  if (!paiement) {
    return sendError(res, "Payment not found", 404);
  }

  const isOwner = paiement.apprenantId?._id.toString() === req.user._id.toString();
  const isAdminOrResponsable = ['admin', 'responsableCF'].includes(req.user.role);

  if (!isOwner && !isAdminOrResponsable) {
    return sendError(res, "Access denied.", 403);
  }

  const formationId = paiement.inscriptionId?.formationId;
  const formation = formationId ? await formationModel.findById(formationId)
    .populate("centreId", "nom")
    .populate("categorieId", "nom") : null;

  return sendSuccess(res, formatPaiement(paiement, formation), "Payment retrieved successfully");
});

// @desc    Create a new payment request
// @route   POST /paiements
// @access  Private (Apprenant)
module.exports.createPaiement = asyncHandler(async (req, res) => {
  const { formationId, methodePaiement } = req.body;
  const apprenantId = req.user._id;

  if (!formationId) {
    return sendError(res, "formationId is required", 400);
  }

  const formation = await formationModel.findById(formationId);
  if (!formation) {
    return sendError(res, "Formation not found", 404);
  }

  if (formation.prix === 0) {
    return sendError(res, "This formation is free. No payment needed.", 400);
  }

  const existingInscription = await inscriptionModel.findOne({ apprenantId, formationId });
  if (existingInscription && existingInscription.statut === "acceptee") {
    return sendError(res, "You are already enrolled in this formation", 400);
  }

  let inscription;
  if (existingInscription) {
    inscription = existingInscription;
  } else {
    inscription = new inscriptionModel({ apprenantId, formationId, statut: "en_attente" });
    await inscription.save();
  }

  const existingPaiement = await paiementModel.findOne({ inscriptionId: inscription._id });
  if (existingPaiement && existingPaiement.statut === "confirme") {
    return sendError(res, "Payment already completed for this inscription", 400);
  }

  const method = methodePaiement || "carte";

  // ── Card payments are confirmed instantly
  const isCardPayment = method === "carte";
  const paiementStatut = isCardPayment ? "confirme" : "en_attente";

  const newPaiement = new paiementModel({
    inscriptionId: inscription._id,
    apprenantId,
    montant: formation.prix,
    methodePaiement: method,
    statut: paiementStatut,
  });
  await newPaiement.save();

  // Auto-accept inscription immediately for card payments
  if (isCardPayment) {
    await inscriptionModel.findByIdAndUpdate(inscription._id, {
      statut: "acceptee",
      dateAcceptation: Date.now(),
    });
  }

  const populatedPaiement = await paiementModel.findById(newPaiement._id)
    .populate("inscriptionId")
    .populate("apprenantId", "nom prenom");

  const populatedFormation = await formationModel.findById(formationId)
    .populate("centreId", "nom")
    .populate("categorieId", "nom");

  // ── Send notifications for pending payments (virement/especes)
  if (!isCardPayment) {
    // Find responsableCF of the formation's centre
    const centre = await centreFormationModel.findById(formation.centreId);
    if (centre?.responsableId) {
      const responsable = await userModel.findById(centre.responsableId).select("nom prenom email");
      
      // Create in-app notification
      await createNotification({
        userId: responsable._id,
        type: "paiement_pending",
        title: "Nouveau paiement en attente",
        message: `Un nouveau paiement de ${req.user.prenom} ${req.user.nom} pour "${populatedFormation.titre}" (${formation.prix} TND) nécessite votre vérification.`,
        relatedId: newPaiement._id,
        relatedModel: "Paiement",
      });

      // Send email notification
      await sendPaymentPendingNotification(responsable, newPaiement, populatedFormation, req.user);
    }
  }

  const message = isCardPayment
    ? "Payment confirmed. You now have instant access to the formation. 🎉"
    : "Payment request submitted. Access will be granted once your payment is verified by an admin.";

  return sendSuccess(res, formatPaiement(populatedPaiement, populatedFormation), message, 201);
});

// @desc    Confirm a payment (ResponsableCF only - for their centre's payments)
// @route   POST /paiements/confirm/:id
// @access  Private (ResponsableCF)
module.exports.confirmPaiement = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(req.params.id).populate("inscriptionId");
  
  if (!paiement) {
    return sendError(res, "Payment not found", 404);
  }

  if (paiement.statut === "confirme") {
    return sendError(res, "Payment already confirmed", 400);
  }

  // Check if ResponsableCF owns this formation's centre
  const checkFormationId = paiement.inscriptionId?.formationId;
  if (checkFormationId) {
    const checkFormation = await formationModel.findById(checkFormationId).populate("centreId");
    if (!checkFormation?.centreId?.responsableId) {
      return sendError(res, "Formation has no responsable assigned", 400);
    }

    const isResponsableOfCentre = checkFormation.centreId.responsableId.toString() === req.user._id.toString();
    if (!isResponsableOfCentre) {
      return sendError(res, "You can only confirm payments for your own centre's formations", 403);
    }
  }

  const updatedPaiement = await paiementModel.findByIdAndUpdate(
    req.params.id,
    { statut: "confirme" },
    { new: true }
  )
    .populate("inscriptionId")
    .populate("apprenantId", "nom prenom");

  await inscriptionModel.findByIdAndUpdate(
    paiement.inscriptionId._id,
    { statut: "acceptee", dateAcceptation: Date.now() }
  );

  const confirmedFormationId = updatedPaiement.inscriptionId?.formationId;
  const confirmedFormation = confirmedFormationId ? await formationModel.findById(confirmedFormationId)
    .populate("centreId", "nom")
    .populate("categorieId", "nom") : null;

  // Notify the apprenant that their payment is confirmed
  const apprenant = await userModel.findById(updatedPaiement.apprenantId?._id || updatedPaiement.apprenantId).select("nom prenom email");
  if (apprenant) {
    await createNotification({
      userId: apprenant._id,
      type: "paiement_confirmed",
      title: "Paiement confirmé",
      message: `Votre paiement pour "${confirmedFormation?.titre}" a été confirmé. Vous avez maintenant accès à la formation.`,
      relatedId: updatedPaiement._id,
      relatedModel: "Paiement",
    });

    await sendPaymentConfirmedNotification(apprenant, updatedPaiement, confirmedFormation);
  }

  return sendSuccess(res, formatPaiement(updatedPaiement, confirmedFormation), "Payment confirmed. Access granted.");
});

// @desc    Cancel own pending payment
// @route   PUT /paiements/cancel/:id
// @access  Private (Owner only)
module.exports.cancelPaiement = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(req.params.id);
  
  if (!paiement) {
    return sendError(res, "Payment not found", 404);
  }

  // Only owner can cancel their own payment
  const isOwner = paiement.apprenantId.toString() === req.user._id.toString();
  if (!isOwner) {
    return sendError(res, "You can only cancel your own payments", 403);
  }

  if (paiement.statut === "confirme") {
    return sendError(res, "Cannot cancel a confirmed payment", 400);
  }

  // Delete the payment and set inscription back to pending
  await paiementModel.findByIdAndDelete(req.params.id);
  
  // Optionally: Could update inscription back to en_attente or delete it
  // For now, we leave the inscription as is
  
  return sendSuccess(res, null, "Payment cancelled successfully");
});

// Note: Delete payment endpoint removed - payments should never be deleted for audit trail
module.exports.deletePaiement = asyncHandler(async (req, res) => {
  return sendError(res, "Payments cannot be deleted. Contact support if needed.", 403);
});

