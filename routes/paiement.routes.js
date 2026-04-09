var express = require('express');
var router = express.Router();
const paiementController = require('../controllers/paiement.controller');

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
 *         montant:
 *           type: number
 *           description: Payment amount
 *         methode:
 *           type: string
 *           enum: [carte, virement, especes]
 *           description: Payment method
 *         statut:
 *           type: string
 *           enum: [en_attente, confirme, echoue]
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
 *     responses:
 *       200:
 *         description: List of payments
 */

/**
 * @swagger
 * /paiements/getPaiementById/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Paiements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /paiements/createPaiement:
 *   post:
 *     summary: Create a new payment
 *     tags: [Paiements]
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
 *               methode:
 *                 type: string
 *                 enum: [carte, virement, especes]
 *     responses:
 *       201:
 *         description: Payment created
 */

/**
 * @swagger
 * /paiements/confirmerPaiement/{id}:
 *   put:
 *     summary: Confirm a payment
 *     tags: [Paiements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */

/**
 * @swagger
 * /paiements/deletePaiement/{id}:
 *   delete:
 *     summary: Delete a payment
 *     tags: [Paiements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted
 */

// ───────── READ ─────────
router.get('/getAllPaiements', paiementController.getAllPaiements);
router.get('/getPaiementById/:id', paiementController.getPaiementById);

// ───────── CREATE ─────────
router.post('/createPaiement', paiementController.createPaiement);

// ───────── CONFIRMER ─────────
router.put('/confirmerPaiement/:id', paiementController.confirmerPaiement);

// ───────── DELETE ─────────
router.delete('/deletePaiement/:id', paiementController.deletePaiement);

module.exports = router;
