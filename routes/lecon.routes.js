var express = require('express');
var router = express.Router();
const leconController = require('../controllers/lecon.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

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
 *         description:
 *           type: string
 *           description: Lesson description
 *         contenu:
 *           type: string
 *           description: Lesson content
 *         duree:
 *           type: string
 *           description: Duration
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         formateurId:
 *           type: string
 *           description: Instructor ID
 *         estAccessible:
 *           type: boolean
 *           description: Is accessible
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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lecon'
 *     responses:
 *       201:
 *         description: Lesson created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Formateur or Admin role
 */

/**
 * @swagger
 * /lecons/updateLecon/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lecons]
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
 *             $ref: '#/components/schemas/Lecon'
 *     responses:
 *       200:
 *         description: Lesson updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires owner or Admin role
 */

/**
 * @swagger
 * /lecons/deleteLecon/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lecons]
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
 *         description: Lesson deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

// ───────── PUBLIC ROUTES ─────────
router.get('/getAllLecons', leconController.getAllLecons);
router.get('/getLeconById/:id', leconController.getLeconById);

// ───────── PROTECTED ROUTES ─────────
// Create: Formateur or Admin
router.post('/createLecon', requireAuth, requireRole('formateur', 'admin'), leconController.createLecon);

// Update: Owner or Admin
router.put('/updateLecon/:id', requireAuth, leconController.updateLecon);

// Delete: Admin only
router.delete('/deleteLecon/:id', requireAuth, requireRole('admin'), leconController.deleteLecon);

module.exports = router;
