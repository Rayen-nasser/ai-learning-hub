var express = require('express');
var router = express.Router();
const avisController = require('../controllers/avis.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Avis:
 *       type: object
 *       properties:
 *         apprenantId:
 *           type: string
 *           description: Learner ID
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         note:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating (1-5)
 *         commentaire:
 *           type: string
 *           description: Review comment
 *         dateAvis:
 *           type: string
 *           format: date
 *           description: Review date
 */

/**
 * @swagger
 * /avis/getAllAvis:
 *   get:
 *     summary: Get all reviews
 *     tags: [Avis]
 *     responses:
 *       200:
 *         description: List of reviews
 */

/**
 * @swagger
 * /avis/getAvisById/{id}:
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

/**
 * @swagger
 * /avis/createAvis:
 *   post:
 *     summary: Create a new review
 *     tags: [Avis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apprenantId
 *               - formationId
 *               - note
 *             properties:
 *               apprenantId:
 *                 type: string
 *               formationId:
 *                 type: string
 *               note:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating (1-5, required)
 *               commentaire:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */

/**
 * @swagger
 * /avis/updateAvis/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Avis]
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
 *             $ref: '#/components/schemas/Avis'
 *     responses:
 *       200:
 *         description: Review updated
 */

/**
 * @swagger
 * /avis/deleteAvis/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */

// ───────── READ ─────────
router.get('/getAllAvis', avisController.getAllAvis);
router.get('/getAvisById/:id', avisController.getAvisById);

// ───────── CREATE / UPDATE / DELETE ─────────
router.post('/createAvis', avisController.createAvis);
router.put('/updateAvis/:id', avisController.updateAvis);
router.delete('/deleteAvis/:id', avisController.deleteAvis);

module.exports = router;
