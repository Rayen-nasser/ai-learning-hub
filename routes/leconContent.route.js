var express = require('express');
var router = express.Router();
const leconContentController = require('../controllers/leconContent.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');
const { uploadSingle } = require('../middlewares/uploadfile');

/**
 * @swagger
 * components:
 *   schemas:
 *     LeconContent:
 *       type: object
 *       properties:
 *         leconId:
 *           type: string
 *           description: Lesson ID
 *         type:
 *           type: string
 *           enum: [video, image, file, test, link]
 *           description: Content type
 *         title:
 *           type: string
 *           description: Content title
 *         description:
 *           type: string
 *           description: Content description
 *         order:
 *           type: number
 *           description: Display order
 *         url:
 *           type: string
 *           description: File URL or embed URL
 *         sourceType:
 *           type: string
 *           enum: [upload, youtube, vimeo, url]
 *           description: Source type
 *         fileName:
 *           type: string
 *           description: Original file name
 *         fileSize:
 *           type: number
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: File MIME type
 *         linkTitle:
 *           type: string
 *           description: Link title
 *         linkUrl:
 *           type: string
 *           description: Link URL
 *         linkDescription:
 *           type: string
 *           description: Link description
 *         passingGrade:
 *           type: number
 *           description: Passing grade percentage
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [multiple_choice, open]
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: mixed
 *               points:
 *                 type: number
 */

/**
 * @swagger
 * /contents/getByLecon/{leconId}:
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
 */

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
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /contents/create:
 *   post:
 *     summary: Create new content for a lesson
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
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Content created
 *       400:
 *         description: Bad request
 */

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
 *       required: true
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
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Content updated
 *       404:
 *         description: Content not found
 */

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
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /contents/submitTest/{id}:
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
 *                 description: Array of answers (index for MC, text for open)
 *     responses:
 *       200:
 *         description: Test results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPoints:
 *                       type: number
 *                     earnedPoints:
 *                       type: number
 *                     percentage:
 *                       type: number
 *                     passingGrade:
 *                       type: number
 *                     passed:
 *                       type: boolean
 */

// ───────── PROTECTED ROUTES ─────────
// Get all content by lesson
router.get('/getByLecon/:leconId', requireAuth, leconContentController.getContentsByLecon);

// Get content by ID
router.get('/:id', requireAuth, leconContentController.getContentById);

// Create content (with optional file upload)
router.post('/create', requireAuth, uploadSingle, leconContentController.createContent);

// Update content
router.put('/:id', requireAuth, uploadSingle, leconContentController.updateContent);

// Delete content
router.delete('/:id', requireAuth, leconContentController.deleteContent);

// Submit test
router.post('/submitTest/:id', requireAuth, leconContentController.submitTest);

module.exports = router;
