var express = require('express');
var router = express.Router();
const formationController = require('../controllers/formation.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

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
 *           type: string
 *           description: Duration
 *         categorieId:
 *           type: string
 *           description: Category ID
 *         centreId:
 *           type: string
 *           description: Centre ID
 */

/**
 * @swagger
 * /formations/getAllFormations:
 *   get:
 *     summary: Get all formations
 *     tags: [Formations]
 *     responses:
 *       200:
 *         description: List of formations
 */

/**
 * @swagger
 * /formations/getFormationById/{id}:
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

/**
 * @swagger
 * /formations/createFormation:
 *   post:
 *     summary: Create a new formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Formation'
 *     responses:
 *       201:
 *         description: Formation created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires ResponsableCF or Admin role
 */

/**
 * @swagger
 * /formations/updateFormation/{id}:
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Formation'
 *     responses:
 *       200:
 *         description: Formation updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires owner or Admin role
 */

/**
 * @swagger
 * /formations/deleteFormation/{id}:
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

// ───────── PUBLIC ROUTES ─────────
router.get('/getAllFormations', formationController.getAllFormations);
router.get('/getFormationById/:id', formationController.getFormationById);

// ───────── PROTECTED ROUTES ─────────
// Create: ResponsableCF or Admin
router.post('/createFormation', requireAuth, requireRole('responsableCF', 'admin'), formationController.createFormation);

// Update: Owner or Admin
router.put('/updateFormation/:id', requireAuth, formationController.updateFormation);

// Delete: Admin only
router.delete('/deleteFormation/:id', requireAuth, requireRole('admin'), formationController.deleteFormation);

module.exports = router;
