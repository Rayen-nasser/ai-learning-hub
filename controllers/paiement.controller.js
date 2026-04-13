const paiementModel = require("../models/paiement.model");
const inscriptionModel = require("../models/inscription.model");
const formationModel = require("../models/formation.model");
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/response");

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

// @desc    Get all payments
// @route   GET /paiements
// @access  Private (Admin)
module.exports.getAllPaiements = asyncHandler(async (req, res) => {
  const paiements = await paiementModel.find()
    .populate("inscriptionId", "formationId")
    .populate("apprenantId", "nom prenom");

  if (paiements.length === 0) {
    return sendError(res, "No payments found", 404);
  }

  const formattedPaiements = paiements.map(formatPaiement);
  return sendSuccess(res, formattedPaiements, "Payments retrieved successfully");
});

// @desc    Get my payments
// @route   GET /paiements/my-paiements
// @access  Private (Apprenant)
module.exports.getMyPaiements = asyncHandler(async (req, res) => {
  const paiements = await paiementModel.find({ apprenantId: req.user._id })
    .populate("inscriptionId", "formationId")
    .populate("apprenantId", "nom prenom");

  const formattedPaiements = paiements.map(formatPaiement);
  return sendSuccess(res, formattedPaiements, "My payments retrieved successfully");
});

// @desc    Get payment by ID
// @route   GET /paiements/:id
// @access  Private (Owner, Admin, ResponsableCF)
module.exports.getPaiementById = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(req.params.id)
    .populate("inscriptionId", "formationId")
    .populate("apprenantId", "nom prenom");

  if (!paiement) {
    return sendError(res, "Payment not found", 404);
  }

  const isOwner = paiement.apprenantId?._id.toString() === req.user._id.toString();
  const isAdminOrResponsable = ['admin', 'responsableCF'].includes(req.user.role);

  if (!isOwner && !isAdminOrResponsable) {
    return sendError(res, "Access denied.", 403);
  }

  return sendSuccess(res, formatPaiement(paiement), "Payment retrieved successfully");
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
    .populate("inscriptionId", "formationId statut")
    .populate("apprenantId", "nom prenom");

  const message = isCardPayment
    ? "Payment confirmed. You now have instant access to the formation. 🎉"
    : "Payment request submitted. Access will be granted once your payment is verified by an admin.";

  return sendSuccess(res, formatPaiement(populatedPaiement), message, 201);
});

// @desc    Confirm a payment (Admin/ResponsableCF)
// @route   POST /paiements/confirm/:id
// @access  Private (Admin, ResponsableCF)
module.exports.confirmPaiement = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(req.params.id).populate("inscriptionId");
  
  if (!paiement) {
    return sendError(res, "Payment not found", 404);
  }

  if (paiement.statut === "confirme") {
    return sendError(res, "Payment already confirmed", 400);
  }

  const updatedPaiement = await paiementModel.findByIdAndUpdate(
    req.params.id,
    { statut: "confirme" },
    { new: true }
  ).populate("inscriptionId", "formationId").populate("apprenantId", "nom prenom");

  await inscriptionModel.findByIdAndUpdate(
    paiement.inscriptionId._id,
    { statut: "acceptee", dateAcceptation: Date.now() }
  );

  return sendSuccess(res, formatPaiement(updatedPaiement), "Payment confirmed. Access granted.");
});

// @desc    Cancel a payment request
// @route   DELETE /paiements/cancel/:id
// @access  Private (Owner, Admin)
module.exports.cancelPaiement = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(req.params.id);
  
  if (!paiement) {
    return sendError(res, "Payment not found", 404);
  }

  if (paiement.statut === "confirme") {
    return sendError(res, "Cannot cancel a confirmed payment", 400);
  }

  await paiementModel.findByIdAndDelete(req.params.id);
  return sendSuccess(res, null, "Payment cancelled successfully");
});

// @desc    Hard delete a payment record (Admin)
// @route   DELETE /paiements/:id
// @access  Private (Admin)
module.exports.deletePaiement = asyncHandler(async (req, res) => {
  const deletedPaiement = await paiementModel.findByIdAndDelete(req.params.id);
  if (!deletedPaiement) {
    return sendError(res, "Payment not found", 404);
  }
  return sendSuccess(res, null, "Payment deleted successfully");
});

