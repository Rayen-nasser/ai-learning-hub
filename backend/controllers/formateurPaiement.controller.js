const mongoose = require("mongoose");
const FormateurContrat = require("../models/formateurContrat.model");
const PaiementFormateur = require("../models/paiementFormateur.model");
const centreFormationModel = require("../models/centreFormation.model");
const formationModel = require("../models/formation.model");
const userModel = require("../models/user.model");
const leconModel = require("../models/lecon.model");
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/response");

// @desc    Get all formateurs
// @route   GET /formateur-paiements/formateurs
// @access  Private (ResponsableCF)
module.exports.getFormateursForMyCentres = asyncHandler(async (req, res) => {
  const formateurs = await userModel.find({ role: "formateur" })
    .select("nom prenom email specialite user_image");

  return sendSuccess(res, formateurs, "Formateurs retrieved successfully");
});

// ── CONTRACTS ──

// @desc    Create a payment contract with a formateur
// @route   POST /formateur-paiements/contrats
// @access  Private (ResponsableCF)
module.exports.createContrat = asyncHandler(async (req, res) => {
  const { formateurId, prixParLecon, dateDebut } = req.body;

  if (!formateurId) {
    return sendError(res, "formateurId is required", 400);
  }

  if (!prixParLecon || prixParLecon <= 0) {
    return sendError(res, "prixParLecon must be greater than 0", 400);
  }

  const centres = await centreFormationModel.find({ responsableId: req.user._id }).select("_id");
  if (centres.length === 0) {
    return sendError(res, "You don't own any centres", 400);
  }

  const centreId = req.body.centreId || centres[0]._id;
  const owned = centres.some(c => c._id.toString() === centreId);
  if (!owned) {
    return sendError(res, "You can only create contracts for your own centres", 403);
  }

  const existing = await FormateurContrat.findOne({
    formateurId,
    centreId,
    statut: { $in: ["en_attente", "actif"] },
  });

  if (existing) {
    return sendError(res, "A pending or active contract already exists with this formateur for this centre", 400);
  }

  const contrat = await FormateurContrat.create({
    formateurId,
    centreId,
    prixParLecon,
    dateDebut: dateDebut || Date.now(),
  });

  const populated = await contrat.populate("formateurId", "nom prenom email");
  return sendSuccess(res, populated, "Contract created successfully", 201);
});

// @desc    Get all contracts for my centres
// @route   GET /formateur-paiements/contrats
// @access  Private (ResponsableCF)
module.exports.getContrats = asyncHandler(async (req, res) => {
  const centres = await centreFormationModel.find({ responsableId: req.user._id }).select("_id");
  const centreIds = centres.map(c => c._id);

  const contrats = await FormateurContrat.find({ centreId: { $in: centreIds } })
    .populate("formateurId", "nom prenom email specialite")
    .populate("centreId", "nom")
    .sort({ createdAt: -1 });

  return sendSuccess(res, contrats, "Contracts retrieved successfully");
});

// @desc    Get my contracts (formateur view)
// @route   GET /formateur-paiements/contrats/mine
// @access  Private (Formateur)
module.exports.getMyContrats = asyncHandler(async (req, res) => {
  const contrats = await FormateurContrat.find({ formateurId: req.user._id })
    .populate("centreId", "nom")
    .sort({ createdAt: -1 });

  return sendSuccess(res, contrats, "My contracts retrieved successfully");
});

// @desc    Confirm a pending contract (formateur accepts)
// @route   PUT /formateur-paiements/contrats/:id/confirm
// @access  Private (Formateur)
module.exports.confirmContrat = asyncHandler(async (req, res) => {
  const contrat = await FormateurContrat.findById(req.params.id);
  if (!contrat) return sendError(res, "Contract not found", 404);

  if (contrat.formateurId.toString() !== req.user._id.toString()) {
    return sendError(res, "Access denied", 403);
  }

  if (contrat.statut !== "en_attente") {
    return sendError(res, "Only pending contracts can be confirmed", 400);
  }

  contrat.statut = "actif";
  await contrat.save();

  const populated = await contrat.populate("centreId", "nom");
  return sendSuccess(res, populated, "Contract confirmed successfully");
});

// @desc    Update a contract
// @route   PUT /formateur-paiements/contrats/:id
// @access  Private (ResponsableCF)
module.exports.updateContrat = asyncHandler(async (req, res) => {
  const contrat = await FormateurContrat.findById(req.params.id);
  if (!contrat) return sendError(res, "Contract not found", 404);

  const centre = await centreFormationModel.findById(contrat.centreId);
  if (!centre || centre.responsableId.toString() !== req.user._id.toString()) {
    return sendError(res, "Access denied", 403);
  }

  const { prixParLecon, statut, dateFin } = req.body;

  if (prixParLecon !== undefined) contrat.prixParLecon = prixParLecon;
  if (statut) contrat.statut = statut;
  if (dateFin) contrat.dateFin = dateFin;

  await contrat.save();
  const populated = await contrat.populate("formateurId", "nom prenom email");
  return sendSuccess(res, populated, "Contract updated successfully");
});

// @desc    Delete a contract
// @route   DELETE /formateur-paiements/contrats/:id
// @access  Private (ResponsableCF)
module.exports.deleteContrat = asyncHandler(async (req, res) => {
  const contrat = await FormateurContrat.findById(req.params.id);
  if (!contrat) return sendError(res, "Contract not found", 404);

  const centre = await centreFormationModel.findById(contrat.centreId);
  if (!centre || centre.responsableId.toString() !== req.user._id.toString()) {
    return sendError(res, "Access denied", 403);
  }

  await FormateurContrat.findByIdAndDelete(req.params.id);
  return sendSuccess(res, null, "Contract deleted successfully");
});

// ── FORMATIONS ──

// @desc    Get formations for RCF's centres
// @route   GET /formateur-paiements/formations
// @access  Private (ResponsableCF)
module.exports.getMyFormations = asyncHandler(async (req, res) => {
  const centres = await centreFormationModel.find({ responsableId: req.user._id }).select("_id");
  const centreIds = centres.map(c => c._id);

  const formations = await formationModel.find({ centreId: { $in: centreIds } })
    .populate("centreId", "nom")
    .select("titre centreId formateurIds")
    .sort({ titre: 1 });

  return sendSuccess(res, formations, "Formations retrieved");
});

// @desc    Assign a formateur (from an active contract) to a formation
// @route   POST /formateur-paiements/contrats/:id/assign-formation
// @access  Private (ResponsableCF)
module.exports.assignFormationToContract = asyncHandler(async (req, res) => {
  const contrat = await FormateurContrat.findById(req.params.id);
  if (!contrat) return sendError(res, "Contract not found", 404);

  if (contrat.statut !== "actif") {
    return sendError(res, "Only active contracts can be assigned to formations", 400);
  }

  const centre = await centreFormationModel.findById(contrat.centreId);
  if (!centre || centre.responsableId.toString() !== req.user._id.toString()) {
    return sendError(res, "Access denied", 403);
  }

  const { formationId } = req.body;
  if (!formationId) return sendError(res, "formationId is required", 400);

  const formation = await formationModel.findById(formationId);
  if (!formation) return sendError(res, "Formation not found", 404);
  if (formation.centreId.toString() !== contrat.centreId.toString()) {
    return sendError(res, "Formation does not belong to this contract's centre", 400);
  }

  const alreadyAssigned = formation.formateurIds.some(id => id.toString() === contrat.formateurId.toString());
  if (alreadyAssigned) {
    return sendError(res, "Formateur is already assigned to this formation", 400);
  }

  formation.formateurIds.push(contrat.formateurId);
  await formation.save();

  return sendSuccess(res, { formationId: formation._id, titre: formation.titre }, "Formateur assigned to formation");
});

// ── PAYMENTS ──

// @desc    Get payments for my centre
// @route   GET /formateur-paiements/payments
// @access  Private (ResponsableCF)
module.exports.getPayments = asyncHandler(async (req, res) => {
  const centres = await centreFormationModel.find({ responsableId: req.user._id }).select("_id");
  const centreIds = centres.map(c => c._id);

  const filter = { centreId: { $in: centreIds } };
  if (req.query.statut) filter.statut = req.query.statut;

  const payments = await PaiementFormateur.find(filter)
    .populate("formateurId", "nom prenom email")
    .populate("leconId", "titre title formationId")
    .populate("centreId", "nom")
    .sort({ createdAt: -1 });

  return sendSuccess(res, payments, "Payments retrieved successfully");
});

// @desc    Get my payments (formateur view)
// @route   GET /formateur-paiements/payments/mine
// @access  Private (Formateur)
module.exports.getMyPayments = asyncHandler(async (req, res) => {
  const filter = { formateurId: req.user._id };
  if (req.query.statut) filter.statut = req.query.statut;

  const payments = await PaiementFormateur.find(filter)
    .populate("centreId", "nom")
    .sort({ createdAt: -1 });

  return sendSuccess(res, payments, "My payments retrieved successfully");
});

// @desc    Mark a payment as paid
// @route   PUT /formateur-paiements/payments/:id/pay
// @access  Private (ResponsableCF)
module.exports.payPayment = asyncHandler(async (req, res) => {
  const payment = await PaiementFormateur.findById(req.params.id);
  if (!payment) return sendError(res, "Payment not found", 404);

  if (payment.statut === "paye") {
    return sendError(res, "Payment already marked as paid", 400);
  }

  const centre = await centreFormationModel.findById(payment.centreId);
  if (!centre || centre.responsableId.toString() !== req.user._id.toString()) {
    return sendError(res, "Access denied", 403);
  }

  const { methodePaiement, reference } = req.body;

  payment.statut = "paye";
  payment.datePaiement = new Date();
  if (methodePaiement) payment.methodePaiement = methodePaiement;
  if (reference) payment.reference = reference;

  await payment.save();

  // If this payment is for a per-lesson lesson, mark that lesson as paid
  if (payment.leconId) {
    await leconModel.findByIdAndUpdate(payment.leconId, { formateurPaye: true });
  }

  const populated = await payment.populate("formateurId", "nom prenom email");
  return sendSuccess(res, populated, "Payment marked as paid");
});

// ── AUTO-CREATE PER-LESSON PAYMENT ──
// Called from lecon controller after a formateur creates a lesson
module.exports.autoCreatePerLessonPayment = async (lecon, formateurId, formationId) => {
  try {
    const formation = await formationModel.findById(formationId);
    if (!formation || !formation.centreId) return;

    const contrat = await FormateurContrat.findOne({
      formateurId,
      centreId: formation.centreId,
      mode: "par_lecon",
      statut: "actif",
    });

    if (!contrat || !contrat.prixParLecon) return;

    await PaiementFormateur.create({
      contratId: contrat._id,
      formateurId,
      centreId: formation.centreId,
      montant: contrat.prixParLecon,
      mode: "par_lecon",
      leconId: lecon._id,
      leconTitre: lecon.titre || lecon.title,
      formationTitre: formation.titre || formation.title,
    });

    // Mark lesson as unpaid — hidden from students until RCF pays
    await leconModel.findByIdAndUpdate(lecon._id, { formateurPaye: false });
  } catch (err) {
    console.error("Auto-create per-lesson payment failed:", err.message);
  }
};
