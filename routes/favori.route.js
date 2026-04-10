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

// ───────── ROUTES ─────────

// GET /favoris - Get all favorites (admin only)
router.get('/', requireAuth, requireRole('admin'), favoriController.getAllFavoris);

// GET /favoris/me - Get my favorites (logged-in user)
router.get('/me', requireAuth, favoriController.getMyFavorites);

// POST /favoris - Create favorite
router.post('/', requireAuth, favoriController.createFavori);

// GET /favoris/:id - Get favorite by ID
router.get('/:id', requireAuth, favoriController.getFavoriById);

// DELETE /favoris/:id - Delete favorite
router.delete('/:id', requireAuth, favoriController.deleteFavori);

module.exports = router;
