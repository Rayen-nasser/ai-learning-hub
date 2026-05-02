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
 *         duree:
 *           type: number
 *           description: Duration in minutes
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         formateurId:
 *           type: string
 *           description: Instructor ID
 *         estAccessible:
 *           type: boolean
 *           description: Is publicly accessible
 *         order:
 *           type: number
 *           description: Display order
 *         hasAccess:
 *           type: boolean
 *           description: Whether current user has access
 *         contentCount:
 *           type: number
 *           description: Number of contents in this lesson
 */

/**
 * @swagger
 * /lecons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lecons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formationId
 *         schema:
 *           type: string
 *         description: Filter by formation ID
 *     responses:
 *       200:
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lecon'
 *                 total:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /lecons/{id}:
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
 *         description: Access denied
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /lecons:
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
 *             type: object
 *             required:
 *               - titre
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               duree:
 *                 type: number
 *               formationId:
 *                 type: string
 *               estAccessible:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Lesson created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Formateur or Admin
 */

/**
 * @swagger
 * /lecons/{id}:
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
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               duree:
 *                 type: number
 *               estAccessible:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lesson updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /lecons/{id}:
 *   delete:
 *     summary: Delete a lesson and its contents
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
 *         description: Access denied
 *       404:
 *         description: Lesson not found
 */

// ───────── PROTECTED ROUTES ─────────
// Get all lessons (with optional formationId filter)
router.get('/', requireAuth, leconController.getLecons);

// Get lesson by ID
router.get('/:id', requireAuth, leconController.getLeconById);

// Create lesson
router.post('/', requireAuth, requireRole('formateur', 'admin'), leconController.createLecon);

// Update lesson
router.put('/:id', requireAuth, leconController.updateLecon);

// AI Assistant for a specific lesson
router.post('/:id/assist', requireAuth, leconController.getAIExplanation);

// Delete lesson
router.delete('/:id', requireAuth, leconController.deleteLecon);

module.exports = router;
