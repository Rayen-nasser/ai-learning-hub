var express = require('express');
var router = express.Router();
const leconController = require('../controllers/lecon.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Lecon:
 *       type: object
 *       properties:
 *         titre:
 *           type: string
 *           description: Lesson title
 *         contenu:
 *           type: string
 *           description: Lesson content
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         ordre:
 *           type: number
 *           description: Lesson order
 *         duree:
 *           type: string
 *           description: Duration
 */

/**
 * @swagger
 * /lecons/getAllLecons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lecons]
 *     responses:
 *       200:
 *         description: List of lessons
 */

/**
 * @swagger
 * /lecons/getLeconById/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lecons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson details
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /lecons/createLecon:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lecons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lecon'
 *     responses:
 *       201:
 *         description: Lesson created
 */

/**
 * @swagger
 * /lecons/updateLecon/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lecons]
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
 *             $ref: '#/components/schemas/Lecon'
 *     responses:
 *       200:
 *         description: Lesson updated
 */

/**
 * @swagger
 * /lecons/deleteLecon/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lecons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted
 */

// ───────── READ (tous les roles) ─────────
router.get('/getAllLecons', leconController.getAllLecons);
router.get('/getLeconById/:id', leconController.getLeconById);

// ───────── CREATE / UPDATE / DELETE ─────────
router.post('/createLecon', leconController.createLecon);
router.put('/updateLecon/:id', leconController.updateLecon);
router.delete('/deleteLecon/:id', leconController.deleteLecon);

module.exports = router;
