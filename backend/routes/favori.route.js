var express = require('express');
var router = express.Router();
const favoriController = require('../controllers/favori.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Favori:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Favorite ID
 *         typeCible:
 *           type: string
 *           enum: [formation, lecon, centreFormation]
 *           description: Type of target
 *         cibleId:
 *           type: string
 *           description: Target ID
 *         cibleTitre:
 *           type: string
 *           description: Target title/name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         apprenantId:
 *           type: object
 *           description: Learner info
 *           properties:
 *             _id:
 *               type: string
 *             nom:
 *               type: string
 *             prenom:
 *               type: string
 *             user_image:
 *               type: string
 */

// ───────── ROUTES ─────────

/**
 * @swagger
 * /favoris:
 *   get:
 *     summary: Get all favorites
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', requireAuth, requireRole('admin'), favoriController.getAllFavoris);

/**
 * @swagger
 * /favoris/me:
 *   get:
 *     summary: Get my favorites
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my favorites
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireAuth, favoriController.getMyFavorites);

/**
 * @swagger
 * /favoris/apprenant/{apprenantId}:
 *   get:
 *     summary: Get favorites by learner ID
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apprenantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Learner's favorites
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/apprenant/:apprenantId', requireAuth, requireRole('admin'), favoriController.getFavorisByApprenant);

/**
 * @swagger
 * /favoris:
 *   post:
 *     summary: Add to favorites
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cibleId
 *               - typeCible
 *             properties:
 *               cibleId:
 *                 type: string
 *                 description: Target ID (formation, lecon, or centreFormation)
 *               typeCible:
 *                 type: string
 *                 enum: [formation, lecon, centreFormation]
 *     responses:
 *       201:
 *         description: Added to favorites
 *       400:
 *         description: Already in favorites
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, favoriController.createFavori);

/**
 * @swagger
 * /favoris/{id}:
 *   get:
 *     summary: Get favorite by ID
 *     tags: [Favoris]
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
 *         description: Favorite details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Favorite not found
 */
router.get('/:id', requireAuth, favoriController.getFavoriById);

/**
 * @swagger
 * /favoris/{id}:
 *   delete:
 *     summary: Remove from favorites
 *     tags: [Favoris]
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
 *         description: Removed from favorites
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Favorite not found
 */
router.delete('/:id', requireAuth, favoriController.deleteFavori);

module.exports = router;
