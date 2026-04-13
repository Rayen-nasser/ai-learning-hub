var express = require('express');
var router = express.Router();
const centreFormationController = require('../controllers/centreFormation.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     CentreFormation:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           description: Centre name
 *         adresse:
 *           type: string
 *           description: Centre address
 *         description:
 *           type: string
 *           description: Centre description
 *         telephone:
 *           type: string
 *           description: Contact phone
 *         logo:
 *           type: string
 *           description: Centre logo URL
 *         responsableId:
 *           type: string
 *           description: Responsible user ID
 */

/**
 * @swagger
 * /centres:
 *   get:
 *     summary: Get all formation centres
 *     tags: [Centres]
 *     responses:
 *       200:
 *         description: List of centres
 */
router.get('/', centreFormationController.getAllCentres);

/**
 * @swagger
 * /centres/my-centres:
 *   get:
 *     summary: Get all centres managed by the logged-in responsableCF
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of managed centres
 */
router.get('/my-centres', requireAuth, requireRole('responsableCF', 'admin'), centreFormationController.getMyCentres);

/**
 * @swagger
 * /centres/formateur/{userId}:
 *   get:
 *     summary: Get all centres where a formateur teaches
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of centres
 */
router.get('/formateur/:userId', requireAuth, centreFormationController.getFormateurCentres);

/**
 * @swagger
 * /centres/{id}:
 *   get:
 *     summary: Get centre by ID
 *     tags: [Centres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Centre details
 *       404:
 *         description: Centre not found
 */
router.get('/:id', centreFormationController.getCentreById);

/**
 * @swagger
 * /centres:
 *   post:
 *     summary: Create a new formation centre
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               adresse:
 *                 type: string
 *               description:
 *                 type: string
 *               telephone:
 *                 type: string
 *               logo:
 *                 type: string
 *               responsableId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Centre created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires ResponsableCF or Admin role
 */
router.post('/', requireAuth, requireRole('responsableCF', 'admin'), centreFormationController.createCentre);


/**
 * @swagger
 * /centres/{id}:
 *   put:
 *     summary: Update a formation centre
 *     tags: [Centres]
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
 *             $ref: '#/components/schemas/CentreFormation'
 *     responses:
 *       200:
 *         description: Centre updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires owner or Admin role
 */
router.put('/:id', requireAuth, centreFormationController.updateCentre);

/**
 * @swagger
 * /centres/{id}:
 *   delete:
 *     summary: Delete a formation centre
 *     tags: [Centres]
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
 *         description: Centre deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAuth, requireRole('admin'), centreFormationController.deleteCentre);

module.exports = router;
