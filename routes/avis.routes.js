var express = require('express');
var router = express.Router();
const avisController = require('../controllers/avis.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Avis:
 *       type: object
 *       properties:
 *         apprenantId:
 *           type: string
 *           description: Learner ID
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         note:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating (1-5)
 *         commentaire:
 *           type: string
 *           description: Review comment
 *         dateAvis:
 *           type: string
 *           format: date
 *           description: Review date
 */

/**
 * @swagger
 * /avis/getAllAvis:
 *   get:
 *     summary: Get all reviews
 *     tags: [Avis]
 *     responses:
 *       200:
 *         description: List of reviews
 */

/**
 * @swagger
 * /avis/getAvisById/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */

/**
 * @swagger
 * /avis/createAvis:
 *   post:
 *     summary: Create a new review
 *     tags: [Avis]
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
 *               - note
 *             properties:
 *               formationId:
 *                 type: string
 *               note:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating (1-5, required)
 *               commentaire:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /avis/updateAvis/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Avis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Avis'
 *     responses:
 *       200:
 *         description: Review updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Self or Admin only
 */

/**
 * @swagger
 * /avis/deleteAvis/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Avis]
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
 *         description: Review deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Self or Admin only
 */

// ───────── PUBLIC ROUTES ─────────
router.get('/getAllAvis', avisController.getAllAvis);
router.get('/getAvisById/:id', avisController.getAvisById);

// ───────── PROTECTED ROUTES ─────────
// Create: Authenticated user
router.post('/createAvis', requireAuth, avisController.createAvis);

// Update: Self or Admin
router.put('/updateAvis/:id', requireAuth, avisController.updateAvis);

// Delete: Self or Admin
router.delete('/deleteAvis/:id', requireAuth, avisController.deleteAvis);

module.exports = router;
