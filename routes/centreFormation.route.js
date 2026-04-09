var express = require('express');
var router = express.Router();
const centreFormationController = require('../controllers/centreFormation.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     CentreFormation:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           description: Centre name
 *         adresse:
 *           type: string
 *           description: Centre address
 *         telephone:
 *           type: string
 *           description: Contact phone
 *         email:
 *           type: string
 *           description: Contact email
 *         responsableId:
 *           type: string
 *           description: Responsible user ID
 */

/**
 * @swagger
 * /centres/getAllCentres:
 *   get:
 *     summary: Get all formation centers
 *     tags: [Centres]
 *     responses:
 *       200:
 *         description: List of centres
 */

/**
 * @swagger
 * /centres/getCentreById/{id}:
 *   get:
 *     summary: Get centre by ID
 *     tags: [Centres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Centre details
 *       404:
 *         description: Centre not found
 */

/**
 * @swagger
 * /centres/createCentre:
 *   post:
 *     summary: Create a new formation centre
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CentreFormation'
 *     responses:
 *       201:
 *         description: Centre created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires ResponsableCF or Admin role
 */

/**
 * @swagger
 * /centres/updateCentre/{id}:
 *   put:
 *     summary: Update a formation centre
 *     tags: [Centres]
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
 *             $ref: '#/components/schemas/CentreFormation'
 *     responses:
 *       200:
 *         description: Centre updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires owner or Admin role
 */

/**
 * @swagger
 * /centres/deleteCentre/{id}:
 *   delete:
 *     summary: Delete a formation centre
 *     tags: [Centres]
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
 *         description: Centre deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

// ───────── PUBLIC ROUTES ─────────
router.get('/getAllCentres', centreFormationController.getAllCentres);
router.get('/getCentreById/:id', centreFormationController.getCentreById);

// ───────── PROTECTED ROUTES ─────────
// Create: ResponsableCF or Admin
router.post('/createCentre', requireAuth, requireRole('responsableCF', 'admin'), centreFormationController.createCentre);

// Update: Owner or Admin
router.put('/updateCentre/:id', requireAuth, centreFormationController.updateCentre);

// Delete: Admin only
router.delete('/deleteCentre/:id', requireAuth, requireRole('admin'), centreFormationController.deleteCentre);

module.exports = router;
