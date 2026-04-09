var express = require('express');
var router = express.Router();
const paiementController = require('../controllers/paiement.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Paiement:
 *       type: object
 *       properties:
 *         inscriptionId:
 *           type: string
 *           description: Inscription ID
 *         apprenantId:
 *           type: string
 *           description: Learner ID
 *         montant:
 *           type: number
 *           description: Payment amount
 *         methodePaiement:
 *           type: string
 *           enum: [carte, virement, especes]
 *           description: Payment method
 *         statut:
 *           type: string
 *           enum: [en attente, confirmé, refusé]
 *           description: Payment status
 *         datePaiement:
 *           type: string
 *           format: date
 *           description: Payment date
 */

/**
 * @swagger
 * /paiements/getAllPaiements:
 *   get:
 *     summary: Get all payments
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or ResponsableCF only
 */

/**
 * @swagger
 * /paiements/getPaiementById/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Self or Admin only
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /paiements/createPaiement:
 *   post:
 *     summary: Create a new payment
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inscriptionId
 *               - montant
 *             properties:
 *               inscriptionId:
 *                 type: string
 *               montant:
 *                 type: number
 *               methodePaiement:
 *                 type: string
 *                 enum: [carte, virement, especes]
 *     responses:
 *       201:
 *         description: Payment created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Apprenant role only
 */

/**
 * @swagger
 * /paiements/confirmerPaiement/{id}:
 *   put:
 *     summary: Confirm a payment
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or ResponsableCF only
 */

/**
 * @swagger
 * /paiements/deletePaiement/{id}:
 *   delete:
 *     summary: Delete a payment
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

// ───────── PROTECTED ROUTES ─────────
// GetAll: Admin or ResponsableCF
router.get('/getAllPaiements', requireAuth, requireRole('admin', 'responsableCF'), paiementController.getAllPaiements);

// GetById: Self or Admin
router.get('/getPaiementById/:id', requireAuth, paiementController.getPaiementById);

// Create: Authenticated user
router.post('/createPaiement', requireAuth, paiementController.createPaiement);

// Confirmer: Admin or ResponsableCF
router.put('/confirmerPaiement/:id', requireAuth, requireRole('admin', 'responsableCF'), paiementController.confirmerPaiement);

// Delete: Admin only
router.delete('/deletePaiement/:id', requireAuth, requireRole('admin'), paiementController.deletePaiement);

module.exports = router;
