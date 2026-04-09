var express = require('express');
var router = express.Router();
const inscriptionController = require('../controllers/inscription.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inscriptions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or ResponsableCF only
 */

/**
 * @swagger
 * /inscriptions/getInscriptionById/{id}:
 *   get:
 *     summary: Get inscription by ID
 *     tags: [Inscriptions]
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
 *         description: Inscription details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Self or Admin only
 *       404:
 *         description: Inscription not found
 */

/**
 * @swagger
 * /inscriptions/createInscription:
 *   post:
 *     summary: Create a new inscription (enroll in formation)
 *     tags: [Inscriptions]
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
 *     responses:
 *       201:
 *         description: Inscription created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Apprenant role only
 */

/**
 * @swagger
 * /inscriptions/validerInscription/{id}:
 *   put:
 *     summary: Validate an inscription
 *     tags: [Inscriptions]
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
 *         description: Inscription validated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or ResponsableCF only
 */

/**
 * @swagger
 * /inscriptions/annulerInscription/{id}:
 *   put:
 *     summary: Cancel an inscription
 *     tags: [Inscriptions]
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
 *         description: Inscription cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or ResponsableCF only
 */

/**
 * @swagger
 * /inscriptions/deleteInscription/{id}:
 *   delete:
 *     summary: Delete an inscription
 *     tags: [Inscriptions]
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
 *         description: Inscription deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

// ───────── PROTECTED ROUTES ─────────
// GetAll: Admin or ResponsableCF
router.get('/getAllInscriptions', requireAuth, requireRole('admin', 'responsableCF'), inscriptionController.getAllInscriptions);

// GetById: Self or Admin or ResponsableCF
router.get('/getInscriptionById/:id', requireAuth, inscriptionController.getInscriptionById);

// Create: Authenticated user (apprenant enrolls)
router.post('/createInscription', requireAuth, inscriptionController.createInscription);

// Valider: Admin or ResponsableCF
router.put('/validerInscription/:id', requireAuth, requireRole('admin', 'responsableCF'), inscriptionController.validerInscription);

// Annuler: Admin or ResponsableCF
router.put('/annulerInscription/:id', requireAuth, requireRole('admin', 'responsableCF'), inscriptionController.annulerInscription);

// Delete: Admin only
router.delete('/deleteInscription/:id', requireAuth, requireRole('admin'), inscriptionController.deleteInscription);

module.exports = router;
