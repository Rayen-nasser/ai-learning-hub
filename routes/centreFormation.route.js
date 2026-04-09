var express = require('express');
var router = express.Router();
const centreFormationController = require('../controllers/centreFormation.controller');

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CentreFormation'
 *     responses:
 *       201:
 *         description: Centre created
 */

/**
 * @swagger
 * /centres/updateCentre/{id}:
 *   put:
 *     summary: Update a formation centre
 *     tags: [Centres]
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
 */

/**
 * @swagger
 * /centres/deleteCentre/{id}:
 *   delete:
 *     summary: Delete a formation centre
 *     tags: [Centres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Centre deleted
 */

// ───────── READ (tous les roles) ─────────
router.get('/getAllCentres', centreFormationController.getAllCentres);
router.get('/getCentreById/:id', centreFormationController.getCentreById);

// ───────── CREATE / UPDATE (responsableCF uniquement) ─────────
router.post('/createCentre', centreFormationController.createCentre);
router.put('/updateCentre/:id', centreFormationController.updateCentre);

// ───────── DELETE (admin uniquement) ─────────
router.delete('/deleteCentre/:id', centreFormationController.deleteCentre);

// ───────── LOGO (responsableCF uniquement - upload désactivé pour le moment) ─────────
// router.put('/uploadLogo/:id', upload.single('logo'), centreFormationController.uploadLogo);

module.exports = router;
