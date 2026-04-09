var express = require('express');
var router = express.Router();
const favoriController = require('../controllers/favori.controller');

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
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         dateAjout:
 *           type: string
 *           format: date
 *           description: Date added
 */

/**
 * @swagger
 * /favoris/getAllFavoris:
 *   get:
 *     summary: Get all favorites
 *     tags: [Favoris]
 *     responses:
 *       200:
 *         description: List of favorites
 */

/**
 * @swagger
 * /favoris/getFavorisByApprenant/{apprenantId}:
 *   get:
 *     summary: Get favorites by learner
 *     tags: [Favoris]
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
 */

/**
 * @swagger
 * /favoris/createFavori:
 *   post:
 *     summary: Create a new favorite
 *     tags: [Favoris]
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
 *         description: Favorite created
 */

/**
 * @swagger
 * /favoris/deleteFavori/{id}:
 *   delete:
 *     summary: Delete a favorite
 *     tags: [Favoris]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite deleted
 */

// ───────── READ ─────────
router.get('/getAllFavoris', favoriController.getAllFavoris);
router.get('/getFavorisByApprenant/:apprenantId', favoriController.getFavorisByApprenant);

// ───────── CREATE / DELETE ─────────
router.post('/createFavori', favoriController.createFavori);
router.delete('/deleteFavori/:id', favoriController.deleteFavori);

module.exports = router;
