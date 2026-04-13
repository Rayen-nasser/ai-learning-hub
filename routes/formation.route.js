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
 *         titre:
 *           type: string
 *           description: Formation title
 *         description:
 *           type: string
 *           description: Formation description
 *         prix:
 *           type: number
 *           description: Formation price
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
 *           type: string
 *           description: Centre ID
 */

const validate = require('../middlewares/validateMiddleware');
const { formationSchema } = require('../validations/formation.validation');

// ───────── ROUTES ─────────

// GET /formations - Get all formations
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
 */
router.get('/', formationController.getAllFormations);

// POST /formations - Create formation
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
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               duree:
 *                 type: number
 *               centreId:
 *                 type: string
 *               categorieId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Formation created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', requireAuth, requireRole('responsableCF', 'admin'), validate(formationSchema), uploadSingle('image', 'images'), formationController.createFormation);


// GET /formations/:id - Get formation by ID
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
 *     responses:
 *       200:
 *         description: Formation details
 *       404:
 *         description: Formation not found
 */
router.get('/:id', formationController.getFormationById);

// PUT /formations/:id - Update formation
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
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               duree:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Formation updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireAuth, uploadSingle('image', 'images'), formationController.updateFormation);

// DELETE /formations/:id - Delete formation
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
 *     responses:
 *       200:
 *         description: Formation deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAuth, requireRole('admin'), formationController.deleteFormation);

// GET /formations/my-assignments - Get formations assigned to current formateur
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
 *         description: List of assigned formations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Formateur only
 */
router.get('/my-assignments', requireAuth, formationController.getMyAssignments);

// GET /formations/:id/formateurs - Get formateurs of a formation
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
 *     responses:
 *       200:
 *         description: List of formateurs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Centre owner or Admin only
 */
router.get('/:id/formateurs', requireAuth, formationController.getFormateurs);

// POST /formations/:id/formateurs - Assign formateurs to a formation
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
 *     responses:
 *       200:
 *         description: Formateurs assigned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Centre owner or Admin only
 */
router.post('/:id/formateurs', requireAuth, formationController.assignFormateurs);

// DELETE /formations/:id/formateurs/:formateurId - Remove formateur from a formation
/**
 * @swagger
 * /formations/{id}/formateurs/{formateurId}:
 *   delete:
 *     summary: Remove formateur from a formation
 *     tags: [Formations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: formateurId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formateur removed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Centre owner or Admin only
 */
router.delete('/:id/formateurs/:formateurId', requireAuth, formationController.removeFormateur);

module.exports = router;
