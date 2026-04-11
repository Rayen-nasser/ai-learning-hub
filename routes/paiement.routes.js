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
 *         montant:
 *           type: number
 *           description: Payment amount
 *         methodePaiement:
 *           type: string
 *           enum: [carte, virement, especes]
 *           description: Payment method
 *         statut:
 *           type: string
 *           enum: [en_attente, confirmé]
 *           description: Payment status
 *         inscriptionId:
 *           type: string
 *           description: Inscription ID
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         formationTitre:
 *           type: string
 *           description: Formation title
 *         apprenantId:
 *           type: string
 *           description: Learner ID
 *         apprenantNom:
 *           type: string
 *           description: Learner last name
 *         apprenantPrenom:
 *           type: string
 *           description: Learner first name
 */

// ───────── ROUTES ─────────

/**
 * @swagger
 * /paiements:
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
 *         description: Forbidden - ResponsableCF only
 */
router.get('/', requireAuth, requireRole('responsableCF'), paiementController.getAllPaiements);

/**
 * @swagger
 * /paiements/me:
 *   get:
 *     summary: Get my payments
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my payments
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireAuth, paiementController.getMyPaiements);

/**
 * @swagger
 * /paiements:
 *   post:
 *     summary: Initiate a payment for a formation
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
 *               - formationId
 *             properties:
 *               formationId:
 *                 type: string
 *                 description: Formation ID
 *               methodePaiement:
 *                 type: string
 *                 enum: [carte, virement, especes]
 *                 description: Payment method
 *     responses:
 *       201:
 *         description: Payment initiated
 *       400:
 *         description: Formation is free or already enrolled
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, paiementController.createPaiement);

/**
 * @swagger
 * /paiements/{id}:
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
 *         description: Forbidden
 *       404:
 *         description: Payment not found
 */
router.get('/:id', requireAuth, paiementController.getPaiementById);

/**
 * @swagger
 * /paiements/{id}/confirm:
 *   put:
 *     summary: Confirm payment (after successful payment)
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
 *         description: Payment confirmed and inscription accepted
 *       400:
 *         description: Payment already confirmed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.put('/:id/confirm', requireAuth, paiementController.confirmPaiement);

/**
 * @swagger
 * /paiements/{id}/cancel:
 *   put:
 *     summary: Cancel a pending payment
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
 *         description: Payment cancelled
 *       400:
 *         description: Cannot cancel confirmed payment
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.put('/:id/cancel', requireAuth, paiementController.cancelPaiement);

/**
 * @swagger
 * /paiements/{id}:
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
 *       404:
 *         description: Payment not found
 */
router.delete('/:id', requireAuth, requireRole('admin'), paiementController.deletePaiement);

module.exports = router;
