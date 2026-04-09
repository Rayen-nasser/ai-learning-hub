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
 *         apprenantId:
 *           type: string
 *           description: Learner ID
 *         cibleId:
 *           type: string
 *           description: Target ID (formation, lecon, or centreFormation)
 *         typeCible:
 *           type: string
 *           enum: [formation, lecon, centreFormation]
 *           description: Type of target
 */

/**
 * @swagger
 * /favoris/getAllFavoris:
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

/**
 * @swagger
 * /favoris/getFavorisByApprenant/{apprenantId}:
 *   get:
 *     summary: Get favorites by learner
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apprenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Learner ID
 *     responses:
 *       200:
 *         description: Learner's favorites
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Self or Admin only
 */

/**
 * @swagger
 * /favoris/createFavori:
 *   post:
 *     summary: Create a new favorite
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
 *               typeCible:
 *                 type: string
 *                 enum: [formation, lecon, centreFormation]
 *     responses:
 *       201:
 *         description: Favorite created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /favoris/deleteFavori/{id}:
 *   delete:
 *     summary: Delete a favorite
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
 *         description: Favorite deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Self or Admin only
 */

// ───────── PROTECTED ROUTES ─────────
// GetAll: Admin only
router.get('/getAllFavoris', requireAuth, requireRole('admin'), favoriController.getAllFavoris);

// GetByApprenant: Self or Admin
router.get('/getFavorisByApprenant/:apprenantId', requireAuth, favoriController.getFavorisByApprenant);

// Create: Authenticated user (self)
router.post('/createFavori', requireAuth, favoriController.createFavori);

// Delete: Self or Admin
router.delete('/deleteFavori/:id', requireAuth, favoriController.deleteFavori);

module.exports = router;
