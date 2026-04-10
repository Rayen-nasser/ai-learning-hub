var express = require('express');
var router = express.Router();
const formationController = require('../controllers/formation.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');
const { uploadSingle } = require('../middlewares/uploadfile');

/**
 * @swagger
 * components:
 *   schemas:
 *     Formation:
 *       type: object
 *       properties:
 *         titre:
 *           type: string
 *           description: Formation title
 *         description:
 *           type: string
 *           description: Formation description
 *         prix:
 *           type: number
 *           description: Formation price
 *         duree:
 *           type: number
 *           description: Duration in hours
 *         image:
 *           type: string
 *           description: Formation image URL
 *         categorieId:
 *           type: string
 *           description: Category ID
 *         centreId:
 *           type: string
 *           description: Centre ID
 */

// ───────── ROUTES ─────────

// GET /formations - Get all formations
/**
 * @swagger
 * /formations:
 *   get:
 *     summary: Get all formations
 *     tags: [Formations]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in titre and description
 *       - in: query
 *         name: centreId
 *         schema:
 *           type: string
 *         description: Filter by centre ID
 *       - in: query
 *         name: categorieId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: prixMin
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: prixMax
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: dureeMin
 *         schema:
 *           type: number
 *         description: Minimum duration (hours)
 *       - in: query
 *         name: dureeMax
 *         schema:
 *           type: number
 *         description: Maximum duration (hours)
 *     responses:
 *       200:
 *         description: List of formations
 */
router.get('/', formationController.getAllFormations);

// POST /formations - Create formation
/**
 * @swagger
 * /formations:
 *   post:
 *     summary: Create a new formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               duree:
 *                 type: number
 *               centreId:
 *                 type: string
 *               categorieId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Formation created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', requireAuth, requireRole('responsableCF', 'admin'), uploadSingle('image', 'images'), formationController.createFormation);

// GET /formations/:id - Get formation by ID
/**
 * @swagger
 * /formations/{id}:
 *   get:
 *     summary: Get formation by ID
 *     tags: [Formations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formation details
 *       404:
 *         description: Formation not found
 */
router.get('/:id', formationController.getFormationById);

// PUT /formations/:id - Update formation
/**
 * @swagger
 * /formations/{id}:
 *   put:
 *     summary: Update a formation
 *     tags: [Formations]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               duree:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Formation updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireAuth, uploadSingle('image', 'images'), formationController.updateFormation);

// DELETE /formations/:id - Delete formation
/**
 * @swagger
 * /formations/{id}:
 *   delete:
 *     summary: Delete a formation
 *     tags: [Formations]
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
 *         description: Formation deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAuth, requireRole('admin'), formationController.deleteFormation);

module.exports = router;
