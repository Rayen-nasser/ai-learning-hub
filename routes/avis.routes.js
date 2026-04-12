var express = require('express');
var router = express.Router();
const avisController = require('../controllers/avis.controller');
const { requireAuth } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Avis:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         note:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         commentaire:
 *           type: string
 *         formationId:
 *           type: string
 *         formationTitre:
 *           type: string
 *         apprenantId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             nom:
 *               type: string
 *             prenom:
 *               type: string
 *             user_image:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ───────── ROUTES ─────────

/**
 * @swagger
 * /avis:
 *   get:
 *     summary: Get all reviews
 *     tags: [Avis]
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/', avisController.getAllAvis);

/**
 * @swagger
 * /avis/me:
 *   get:
 *     summary: Get my reviews
 *     tags: [Avis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my reviews
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireAuth, avisController.getMyAvis);

/**
 * @swagger
 * /avis/formation/{formationId}:
 *   get:
 *     summary: Get reviews by formation ID
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: formationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews for the formation
 */
router.get('/formation/:formationId', avisController.getAvisByFormation);

/**
 * @swagger
 * /avis/{id}:
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
router.get('/:id', avisController.getAvisById);

/**
 * @swagger
 * /avis:
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
 *               commentaire:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Must be enrolled to review
 */
router.post('/', requireAuth, avisController.createAvis);

/**
 * @swagger
 * /avis/{id}:
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               commentaire:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.put('/:id', requireAuth, avisController.updateAvis);

/**
 * @swagger
 * /avis/{id}:
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
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.delete('/:id', requireAuth, avisController.deleteAvis);

module.exports = router;
