var express = require('express');
var router = express.Router();
const leconContentController = require('../controllers/leconContent.controller');
const { requireAuth } = require('../middlewares/authMiddleware');
const { uploadSingle, createUploadMiddleware } = require('../middlewares/uploadfile');

/**
 * @swagger
 * components:
 *   schemas:
 *     LeconContent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         leconId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [video, image, file, test, link]
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         order:
 *           type: number
 *         url:
 *           type: string
 *         sourceType:
 *           type: string
 *           enum: [upload, youtube, vimeo, url]
 *         passingGrade:
 *           type: number
 *         questions:
 *           type: array
 */

// ───────── ROUTES ─────────

/**
 * @swagger
 * /contents:
 *   post:
 *     summary: Create content for a lesson
 *     tags: [LeconContents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - leconId
 *               - type
 *               - title
 *             properties:
 *               leconId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, image, file, test, link]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               sourceType:
 *                 type: string
 *                 enum: [upload, youtube, vimeo, url]
 *               url:
 *                 type: string
 *               linkTitle:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               linkDescription:
 *                 type: string
 *               passingGrade:
 *                 type: number
 *               questions:
 *                 type: array
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Content created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, createUploadMiddleware('contents').any(), leconContentController.createContent);

/**
 * @swagger
 * /contents/lesson/{leconId}:
 *   get:
 *     summary: Get all content for a lesson
 *     tags: [LeconContents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leconId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contents
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.get('/lesson/:leconId', requireAuth, leconContentController.getContentsByLecon);

/**
 * @swagger
 * /contents/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [LeconContents]
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
 *         description: Content details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.get('/:id', requireAuth, leconContentController.getContentById);

/**
 * @swagger
 * /contents/{id}:
 *   put:
 *     summary: Update content
 *     tags: [LeconContents]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               url:
 *                 type: string
 *               passingGrade:
 *                 type: number
 *               questions:
 *                 type: array
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Content updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.put('/:id', requireAuth, createUploadMiddleware('contents').any(), leconContentController.updateContent);
router.post('/:id', requireAuth, createUploadMiddleware('contents').any(), leconContentController.updateContent);

/**
 * @swagger
 * /contents/{id}:
 *   delete:
 *     summary: Delete content
 *     tags: [LeconContents]
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
 *         description: Content deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.delete('/:id', requireAuth, leconContentController.deleteContent);

/**
 * @swagger
 * /contents/{id}/submit:
 *   post:
 *     summary: Submit test answers
 *     tags: [LeconContents]
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
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: mixed
 *     responses:
 *       200:
 *         description: Test results
 *       400:
 *         description: This content is not a test
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.post('/:id/submit', requireAuth, leconContentController.submitTest);

module.exports = router;
