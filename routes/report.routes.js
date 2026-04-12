var express = require('express');
var router = express.Router();
const reportController = require('../controllers/report.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [user, formation, centre, formateur]
 *         targetId:
 *           type: string
 *         reason:
 *           type: string
 *         description:
 *           type: string
 *         reportsCount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, reviewed, resolved, dismissed]
 */

// ───────── PUBLIC ROUTES ─────────

/**
 * @swagger
 * /reports/reasons:
 *   get:
 *     summary: Get pre-defined report reasons
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter reasons by type
 *     responses:
 *       200:
 *         description: Report reasons
 */
router.get('/reasons', reportController.getReasons);

// ───────── PROTECTED ROUTES ─────────

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Submit a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - targetId
 *               - reason
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [user, formation, centre, formateur]
 *               targetId:
 *                 type: string
 *               reason:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted
 *       400:
 *         description: Invalid reason or already reported
 *       403:
 *         description: Must be enrolled to report formation
 */
router.post('/', requireAuth, reportController.createReport);

/**
 * @swagger
 * /reports/my:
 *   get:
 *     summary: Get my reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my reports
 */
router.get('/my', requireAuth, reportController.getMyReports);

// ───────── ADMIN ROUTES ─────────

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of reports
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', requireAuth, requireRole('admin'), reportController.getReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report by ID (admin only)
 *     tags: [Reports]
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
 *         description: Report details
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Report not found
 */
router.get('/:id', requireAuth, requireRole('admin'), reportController.getReportById);

/**
 * @swagger
 * /reports/{id}/review:
 *   put:
 *     summary: Review a report (admin only)
 *     tags: [Reports]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [reviewed, resolved, dismissed]
 *               action:
 *                 type: string
 *                 description: Action taken (e.g., "block", "delete", "warn")
 *               reviewNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report reviewed
 *       400:
 *         description: Invalid status or already reviewed
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id/review', requireAuth, requireRole('admin'), reportController.reviewReport);

module.exports = router;
