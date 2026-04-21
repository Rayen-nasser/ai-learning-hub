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
 */

// ───────── ROUTES ─────────

/**
 * @swagger
 * /inscriptions:
 *   get:
 *     summary: Get all inscriptions (responsableCF only)
 *     tags: [Inscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inscriptions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - ResponsableCF only
 */
router.get('/', requireAuth, requireRole('responsableCF'), inscriptionController.getAllInscriptions);

/**
 * @swagger
 * /inscriptions/me:
 *   get:
 *     summary: Get my inscriptions (logged-in user)
 *     tags: [Inscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my inscriptions
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireAuth, inscriptionController.getMyInscriptions);

/**
 * @swagger
 * /inscriptions:
 *   post:
 *     summary: Create inscription (enroll in formation)
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
 *                 description: Formation ID
 *     responses:
 *       201:
 *         description: Inscription created
 *       400:
 *         description: Already enrolled or formation not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, inscriptionController.createInscription);

/**
 * @swagger
 * /inscriptions/{id}:
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
 *       404:
 *         description: Inscription not found
 */
router.get('/:id', requireAuth, inscriptionController.getInscriptionById);

/**
 * @swagger
 * /inscriptions/cancel/{id}:
 *   put:
 *     summary: Cancel own pending inscription
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
 *       400:
 *         description: Cannot cancel accepted/rejected inscription
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can cancel
 *       404:
 *         description: Inscription not found
 */
router.put('/cancel/:id', requireAuth, inscriptionController.cancelInscription);

/**
 * @swagger
 * /inscriptions/reject/{id}:
 *   put:
 *     summary: Reject inscription (ResponsableCF only - for their centre)
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
 *         description: Inscription rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - ResponsableCF only
 *       404:
 *         description: Inscription not found
 */
router.put('/reject/:id', requireAuth, requireRole('responsableCF'), inscriptionController.rejectInscription);

/**
 * @swagger
 * /inscriptions/reactivate/{id}:
 *   put:
 *     summary: Reactivate rejected inscription (ResponsableCF only - for their centre)
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
 *         description: Inscription reactivated
 *       400:
 *         description: Can only reactivate rejected inscriptions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - ResponsableCF only
 *       404:
 *         description: Inscription not found
 */
router.put('/reactivate/:id', requireAuth, requireRole('responsableCF'), inscriptionController.reactivateInscription);

module.exports = router;
