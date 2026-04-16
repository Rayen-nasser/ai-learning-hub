var express = require('express');
var router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { requireAuth } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [paiement_pending, paiement_confirmed, inscription_request, inscription_accepted, inscription_rejected, report_submitted, report_resolved, new_formation, system]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         relatedId:
 *           type: string
 *         relatedModel:
 *           type: string
 *         read:
 *           type: boolean
 *         createdAt:
 *           type: string
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter unread only
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', requireAuth, notificationController.getMyNotifications);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread-count', requireAuth, notificationController.getUnreadCount);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', requireAuth, notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/read/:id:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/read/:id', requireAuth, notificationController.markAsRead);

/**
 * @swagger
 * /notifications/delete/:id:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/delete/:id', requireAuth, notificationController.deleteNotification);

/**
 * @swagger
 * /notifications/delete-all:
 *   delete:
 *     summary: Delete all my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 */
router.delete('/delete-all', requireAuth, notificationController.deleteAllNotifications);

module.exports = router;
