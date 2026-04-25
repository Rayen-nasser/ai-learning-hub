var express = require('express');
var router = express.Router();
const centreFormationController = require('../controllers/centreFormation.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');
const { uploadSingle } = require('../middlewares/uploadfile');

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
router.get('/my-centres', requireAuth, centreFormationController.getMyCentres);

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
 * /centres/requirements:
 *   get:
 *     summary: Get the list of required documents for centre verification
 *     tags: [Centres]
 *     responses:
 *       200:
 *         description: List of requirements
 */
router.get('/requirements', centreFormationController.getVerificationRequirements);

/**
 * @swagger
 * /centres/{id}/status:
 *   get:
 *     summary: Get the full application status with document-level feedback for the applicant
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Application status and per-document feedback
 */
router.get('/:id/status', requireAuth, centreFormationController.getApplicationStatus);

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
 * /centres/admin/pending:
 *   get:
 *     summary: Get all pending centre creation requests
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending centres
 *       403:
 *         description: Forbidden - admin only
 */
router.get('/admin/pending', requireAuth, requireRole('admin'), centreFormationController.getPendingCentres);

/**
 * @swagger
 * /centres/admin/approve/{id}:
 *   patch:
 *     summary: Approve a centre creation request
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Centre approved
 */
router.patch('/admin/approve/:id', requireAuth, requireRole('admin'), centreFormationController.approveCentre);

/**
 * @swagger
 * /centres/admin/reject/{id}:
 *   patch:
 *     summary: Reject a centre creation request
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Centre rejected
 */
router.patch('/admin/reject/:id', requireAuth, requireRole('admin'), centreFormationController.rejectCentre);

/**
 * @swagger
 * /centres/admin/{id}/document-status:
 *   patch:
 *     summary: Update status of a specific document in a request
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               docId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [valid, invalid]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/admin/:id/document-status', requireAuth, requireRole('admin'), centreFormationController.updateDocumentStatus);

/**
 * @swagger
 * /centres:
 *   post:
 *     summary: Submit a new formation centre creation request
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - registration
 *               - tax_id
 *               - identity
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
 *                 format: binary
 *               registration:
 *                 type: string
 *                 format: binary
 *                 description: Commercial Registration (Registre de Commerce)
 *               tax_id:
 *                 type: string
 *                 format: binary
 *                 description: Tax ID (Matricule Fiscal)
 *               identity:
 *                 type: string
 *                 format: binary
 *                 description: ID Document (CIN/Passport)
 *               authorization:
 *                 type: string
 *                 format: binary
 *                 description: Official Authorization/Accreditation
 *               lease:
 *                 type: string
 *                 format: binary
 *                 description: Lease Agreement/Proof of location
 *     responses:
 *       201:
 *         description: Request submitted
 *       400:
 *         description: Missing mandatory documents
 */
const { privateUpload } = require('../middlewares/uploadfile');
router.post('/', requireAuth, privateUpload.any(), centreFormationController.createCentre);

/**
 * @swagger
 * /centres/{id}/documents:
 *   patch:
 *     summary: Update/Re-submit verification documents
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               registration:
 *                 type: string
 *                 format: binary
 *               tax_id:
 *                 type: string
 *                 format: binary
 *               identity:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documents updated
 */
router.patch('/:id/documents', requireAuth, privateUpload.any(), centreFormationController.updateDocuments);


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
 *         multipart/form-data:
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
 *                 format: binary
 *     responses:
 *       200:
 *         description: Centre updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires owner or Admin role
 */
router.put('/:id', requireAuth, uploadSingle('logo', 'images'), centreFormationController.updateCentre);

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

/**
 * @swagger
 * /centres/{id}/documents/{docId}:
 *   get:
 *     summary: View a private verification document
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: docId
 *         required: true
 *     responses:
 *       200:
 *         description: File stream
 *       403:
 *         description: Forbidden
 */
router.get('/:id/documents/:docId', requireAuth, centreFormationController.viewDocument);

/**
 * @swagger
 * /centres/{id}/documents:
 *   patch:
 *     summary: Re-submit/update verification documents (for applicant to fix invalid docs)
 *     tags: [Centres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               registration:
 *                 type: string
 *                 format: binary
 *                 description: Commercial Registration
 *               tax_id:
 *                 type: string
 *                 format: binary
 *                 description: Tax Identification
 *               identity:
 *                 type: string
 *                 format: binary
 *                 description: ID Document (CIN/Passport)
 *               authorization:
 *                 type: string
 *                 format: binary
 *                 description: Official Authorization
 *               lease:
 *                 type: string
 *                 format: binary
 *                 description: Lease Agreement
 *     responses:
 *       200:
 *         description: Documents updated, status reset to pending for re-review
 *       400:
 *         description: No files uploaded or centre already approved
 *       403:
 *         description: Not the owner
 */
const { privateUpload } = require('../middlewares/uploadfile');
router.patch('/:id/documents', requireAuth, privateUpload.any(), centreFormationController.updateDocuments);

module.exports = router;
