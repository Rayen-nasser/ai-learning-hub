var express = require('express');
var router = express.Router();
const inscriptionController = require('../controllers/inscription.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Inscription:
 *       type: object
 *       properties:
 *         apprenantId:
 *           type: string
 *           description: Learner ID
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         statut:
 *           type: string
 *           enum: [en attente, acceptée, refusée]
 *           description: Registration status
 *         dateInscription:
 *           type: string
 *           format: date
 *           description: Registration date
 */

/**
 * @swagger
 * /inscriptions/getAllInscriptions:
 *   get:
 *     summary: Get all inscriptions
 *     tags: [Inscriptions]
 *     responses:
 *       200:
 *         description: List of inscriptions
 */

/**
 * @swagger
 * /inscriptions/getInscriptionById/{id}:
 *   get:
 *     summary: Get inscription by ID
 *     tags: [Inscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription details
 *       404:
 *         description: Inscription not found
 */

/**
 * @swagger
 * /inscriptions/createInscription:
 *   post:
 *     summary: Create a new inscription
 *     tags: [Inscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apprenantId
 *               - formationId
 *             properties:
 *               apprenantId:
 *                 type: string
 *               formationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inscription created
 */

/**
 * @swagger
 * /inscriptions/validerInscription/{id}:
 *   put:
 *     summary: Validate an inscription
 *     tags: [Inscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription validated
 */

/**
 * @swagger
 * /inscriptions/annulerInscription/{id}:
 *   put:
 *     summary: Cancel an inscription
 *     tags: [Inscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription cancelled
 */

/**
 * @swagger
 * /inscriptions/deleteInscription/{id}:
 *   delete:
 *     summary: Delete an inscription
 *     tags: [Inscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription deleted
 */

// ───────── READ ─────────
router.get('/getAllInscriptions', inscriptionController.getAllInscriptions);
router.get('/getInscriptionById/:id', inscriptionController.getInscriptionById);

// ───────── CREATE ─────────
router.post('/createInscription', inscriptionController.createInscription);

// ───────── VALIDER / ANNULER ─────────
router.put('/validerInscription/:id', inscriptionController.validerInscription);
router.put('/annulerInscription/:id', inscriptionController.annulerInscription);

// ───────── DELETE ─────────
router.delete('/deleteInscription/:id', inscriptionController.deleteInscription);

module.exports = router;
