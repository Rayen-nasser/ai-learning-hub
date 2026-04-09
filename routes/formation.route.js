var express = require('express');
var router = express.Router();
const formationController = require('../controllers/formation.controller');

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Formation'
 *     responses:
 *       201:
 *         description: Formation created
 */

/**
 * @swagger
 * /formations/updateFormation/{id}:
 *   put:
 *     summary: Update a formation
 *     tags: [Formations]
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
 */

/**
 * @swagger
 * /formations/deleteFormation/{id}:
 *   delete:
 *     summary: Delete a formation
 *     tags: [Formations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formation deleted
 */

// ───────── READ (tous les roles) ─────────
router.get('/getAllFormations', formationController.getAllFormations);
router.get('/getFormationById/:id', formationController.getFormationById);

// ───────── CREATE / UPDATE / DELETE ─────────
router.post('/createFormation', formationController.createFormation);
router.put('/updateFormation/:id', formationController.updateFormation);
router.delete('/deleteFormation/:id', formationController.deleteFormation);

module.exports = router;
