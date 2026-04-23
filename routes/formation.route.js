var express = require('express');
var router = express.Router();
const formationController = require('../controllers/formation.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');
const { uploadSingle } = require('../middlewares/uploadfile');

/**
 * @swagger
 * components:
 *   schemas:
 *     Formation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Formation ID
 *         titre:
 *           type: string
 *           description: Formation title
 *         description:
 *           type: string
 *           description: Formation description
 *         prix:
 *           type: number
 *           description: Formation price (0 for free)
 *         duree:
 *           type: number
 *           description: Duration in hours
 *         image:
 *           type: string
 *           description: Formation image URL
 *         categorieId:
 *           type: string
 *           description: Category ID
 *         centreId:
 *           type: object
 *           description: Centre information
 *           properties:
 *             _id:
 *               type: string
 *             nom:
 *               type: string
 *         formateurIds:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Formateur:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Formateur ID
 *         nom:
 *           type: string
 *           description: Formateur last name
 *         prenom:
 *           type: string
 *           description: Formateur first name
 *         email:
 *           type: string
 *           description: Formateur email
 *         user_image:
 *           type: string
 *           description: Formateur profile image
 */

const validate = require('../middlewares/validateMiddleware');
const { formationSchema } = require('../validations/formation.validation');

// ───────── ROUTES ─────────

/**
 * @swagger
 * /formations:
 *   get:
 *     summary: Get all formations
 *     tags: [Formations]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in titre and description
 *       - in: query
 *         name: centreId
 *         schema:
 *           type: string
 *         description: Filter by centre ID
 *       - in: query
 *         name: categorieId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: prixMin
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: prixMax
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: dureeMin
 *         schema:
 *           type: number
 *         description: Minimum duration (hours)
 *       - in: query
 *         name: dureeMax
 *         schema:
 *           type: number
 *         description: Maximum duration (hours)
 *     responses:
 *       200:
 *         description: List of formations
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
 *                     $ref: '#/components/schemas/Formation'
  */
router.get('/', formationController.getAllFormations);

/**
 * @swagger
 * /formations/formateurs:
 *   get:
 *     summary: Get all available formateurs
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formationId
 *         schema:
 *           type: string
 *         description: Optional formation ID to filter formateurs by matching skills
 *     responses:
 *       200:
 *         description: List of all formateurs
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
 *                     $ref: '#/components/schemas/Formateur'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only responsableCF or admin
 */
router.get('/formateurs', requireAuth, requireRole('responsableCF', 'admin'), formationController.getAvailableFormateurs);

/**
 * @swagger
 * /formations/my-assignments:
 *   get:
 *     summary: Get formations assigned to current formateur
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of formations assigned to the current formateur
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
 *                     $ref: '#/components/schemas/Formation'
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       403:
 *         description: Forbidden - Only formateurs can access this endpoint
 */
router.get('/my-assignments', requireAuth, formationController.getMyAssignments);

/**
 * @swagger
 * /formations/my-centre:
 *   get:
 *     summary: Get formations for ResponsableCF's own centre
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of formations for the user's centre
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only responsableCF can access this endpoint
 */
router.get('/my-centre', requireAuth, requireRole('responsableCF'), formationController.getMyCentreFormations);

/**
 * @swagger
 * /formations:
 *   post:
 *     summary: Create a new formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Formation title
 *                 example: "Web Development Fundamentals"
 *               description:
 *                 type: string
 *                 description: Formation description
 *                 example: "Learn the basics of web development"
 *               prix:
 *                 type: number
 *                 description: Formation price (0 for free)
 *                 example: 99.99
 *               duree:
 *                 type: number
 *                 description: Duration in hours
 *                 example: 40
 *               centreId:
 *                 type: string
 *                 description: Centre ID
 *                 example: "507f1f77bcf86cd799439011"
 *               categorieId:
 *                 type: string
 *                 description: Category ID
 *                 example: "507f1f77bcf86cd799439012"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Formation image file
 *     responses:
 *       201:
 *         description: Formation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Formation'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only responsableCF or admin can create formations
 */
router.post('/', requireAuth, requireRole('responsableCF', 'admin'), validate(formationSchema), uploadSingle('image', 'images'), formationController.createFormation);

/**
 * @swagger
 * /formations/{id}:
 *   get:
 *     summary: Get formation by ID
 *     tags: [Formations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Formation ID
 *     responses:
 *       200:
 *         description: Formation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Formation'
 *       404:
 *         description: Formation not found
 */
router.get('/:id', formationController.getFormationById);

/**
 * @swagger
 * /formations/{id}:
 *   put:
 *     summary: Update a formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Formation ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Formation title
 *               description:
 *                 type: string
 *                 description: Formation description
 *               prix:
 *                 type: number
 *                 description: Formation price
 *               duree:
 *                 type: number
 *                 description: Duration in hours
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Formation image file
 *     responses:
 *       200:
 *         description: Formation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Formation'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only centre owner or admin can update
 *       404:
 *         description: Formation not found
 */
router.put('/:id', requireAuth, uploadSingle('image', 'images'), formationController.updateFormation);

// Alias POST for updates (useful for some multipart-form-data clients)
router.post('/:id', requireAuth, uploadSingle('image', 'images'), formationController.updateFormation);

/**
 * @swagger
 * /formations/{id}:
 *   delete:
 *     summary: Delete a formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Formation ID
 *     responses:
 *       200:
 *         description: Formation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Formation not found
 */
router.delete('/:id', requireAuth, requireRole('admin', 'responsableCF'), formationController.deleteFormation);

/**
 * @swagger
 * /formations/{id}/formateurs:
 *   get:
 *     summary: Get formateurs assigned to a formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Formation ID
 *     responses:
 *       200:
 *         description: List of formateurs assigned to the formation
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
 *                     $ref: '#/components/schemas/Formateur'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only centre owner or admin can view
 *       404:
 *         description: Formation not found
 */
router.get('/:id/formateurs', requireAuth, formationController.getFormateurs);

/**
 * @swagger
 * /formations/{id}/formateurs:
 *   post:
 *     summary: Assign formateurs to a formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Formation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - formateurIds
 *             properties:
 *               formateurIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of formateur user IDs
 *                 example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *     responses:
 *       200:
 *         description: Formateurs assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Formation'
 *       400:
 *         description: Bad request - Invalid formateur IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only centre owner or admin can assign formateurs
 *       404:
 *         description: Formation not found
 */
router.post('/:id/formateurs', requireAuth, formationController.assignFormateurs);

/**
 * @swagger
 * /formations/{id}/formateurs/{formateurId}:
 *   delete:
 *     summary: Remove a formateur from a formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Formation ID
 *       - in: path
 *         name: formateurId
 *         required: true
 *         schema:
 *           type: string
 *         description: Formateur user ID to remove
 *     responses:
 *       200:
 *         description: Formateur removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only centre owner or admin can remove formateurs
 *       404:
 *         description: Formation not found
 */
router.delete('/:id/formateurs/:formateurId', requireAuth, formationController.removeFormateur);

module.exports = router;
