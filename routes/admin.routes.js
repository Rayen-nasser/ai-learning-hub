var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminStats:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *         formations:
 *           type: object
 *         enrollments:
 *           type: object
 *         revenue:
 *           type: object
 */

// ───────── STATS ROUTES ─────────

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/stats', requireAuth, requireRole('admin'), adminController.getStats);

/**
 * @swagger
 * /admin/formations/stats:
 *   get:
 *     summary: Get formations statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Formations statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/formations/stats', requireAuth, requireRole('admin'), adminController.getFormationStats);

/**
 * @swagger
 * /admin/paiements/stats:
 *   get:
 *     summary: Get payments statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/paiements/stats', requireAuth, requireRole('admin'), adminController.getPaiementStats);

// ───────── REPORTS ROUTES ─────────

/**
 * @swagger
 * /admin/reports/users:
 *   get:
 *     summary: Get new users report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *         description: 'Number of days to look back (default: 7)'
 *     responses:
 *       200:
 *         description: New users report
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/reports/users', requireAuth, requireRole('admin'), adminController.getReportUsers);

/**
 * @swagger
 * /admin/reports/enrollments:
 *   get:
 *     summary: Get enrollments report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *         description: 'Number of days to look back (default: 7)'
 *     responses:
 *       200:
 *         description: Enrollments report
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/reports/enrollments', requireAuth, requireRole('admin'), adminController.getReportEnrollments);

/**
 * @swagger
 * /admin/reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *         description: 'Number of days to look back (default: 30)'
 *     responses:
 *       200:
 *         description: Revenue report
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/reports/revenue', requireAuth, requireRole('admin'), adminController.getReportRevenue);

// ───────── USER MANAGEMENT ROUTES ─────────

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: blocked
 *         schema:
 *           type: boolean
 *         description: Filter by blocked status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in nom, prenom, email
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users with pagination
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/users', requireAuth, requireRole('admin'), adminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID with activity
 *     tags: [Admin]
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
 *         description: User details with activity
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.get('/users/:id', requireAuth, requireRole('admin'), adminController.getUserById);

/**
 * @swagger
 * /admin/users/{id}/block:
 *   put:
 *     summary: Block a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for blocking
 *               expiresInDays:
 *                 type: number
 *                 description: Auto-unblock after X days
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Cannot block yourself or already blocked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.put('/users/:id/block', requireAuth, requireRole('admin'), adminController.blockUser);

/**
 * @swagger
 * /admin/users/{id}/unblock:
 *   put:
 *     summary: Unblock a user
 *     tags: [Admin]
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
 *         description: User unblocked successfully
 *       400:
 *         description: User is not blocked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.put('/users/:id/unblock', requireAuth, requireRole('admin'), adminController.unblockUser);

/**
 * @swagger
 * /admin/block-history:
 *   get:
 *     summary: Get block/unblock history
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Block history with pagination
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/block-history', requireAuth, requireRole('admin'), adminController.getBlockHistory);

module.exports = router;
