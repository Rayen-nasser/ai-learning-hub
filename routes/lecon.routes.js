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
 *     summary: Get all lessons (filtered by access)
 *     tags: [Lecons]
 *     security:
 *       - bearerAuth: []
 *     description: Returns lessons the user can access (instructor of lesson or enrolled in formation)
 *     responses:
 *       200:
 *         description: List of accessible lessons
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /lecons/getLeconById/{id}:
 *   get:
 *     summary: Get lesson by ID
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
 *         description: Lesson details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor or enrolled learner only
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

// ───────── PROTECTED ROUTES ─────────
// GetAll: Authenticated (filtered by access)
router.get('/getAllLecons', requireAuth, leconController.getAllLecons);

// GetById: Instructor or enrolled learner
router.get('/getLeconById/:id', requireAuth, leconController.getLeconById);

// Create: Formateur or Admin
router.post('/createLecon', requireAuth, requireRole('formateur', 'admin'), leconController.createLecon);

// Update: Owner or Admin
router.put('/updateLecon/:id', requireAuth, leconController.updateLecon);

// Delete: Admin only
router.delete('/deleteLecon/:id', requireAuth, requireRole('admin'), leconController.deleteLecon);

module.exports = router;
