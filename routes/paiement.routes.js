var express = require('express');
var router = express.Router();
const paiementController = require('../controllers/paiement.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

// ───────── ROUTES ─────────

// GET /paiements - Get all payments (responsableCF only)
router.get('/', requireAuth, requireRole('responsableCF'), paiementController.getAllPaiements);

// GET /paiements/me - Get my payments
router.get('/me', requireAuth, paiementController.getMyPaiements);

// POST /paiements - Initiate payment
router.post('/', requireAuth, paiementController.createPaiement);

// GET /paiements/:id - Get payment by ID
router.get('/:id', requireAuth, paiementController.getPaiementById);

// PUT /paiements/:id/confirm - Confirm payment (after successful payment)
router.put('/:id/confirm', requireAuth, paiementController.confirmPaiement);

// PUT /paiements/:id/cancel - Cancel payment
router.put('/:id/cancel', requireAuth, paiementController.cancelPaiement);

// DELETE /paiements/:id - Delete payment (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), paiementController.deletePaiement);

module.exports = router;
