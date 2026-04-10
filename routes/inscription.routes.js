var express = require('express');
var router = express.Router();
const inscriptionController = require('../controllers/inscription.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Inscription:
 *       type: object
 *       properties:
 *         apprenantId:
 *           type: string
 *           description: Learner ID
 *         formationId:
 *           type: string
 *           description: Formation ID
 *         statut:
 *           type: string
 *           enum: [en attente, acceptée, refusée]
 *           description: Registration status
 */

// ───────── ROUTES ─────────

// GET /inscriptions - Get all inscriptions (responsableCF only)
router.get('/', requireAuth, requireRole('responsableCF'), inscriptionController.getAllInscriptions);

// GET /inscriptions/me - Get my inscriptions (logged-in user)
router.get('/me', requireAuth, inscriptionController.getMyInscriptions);

// POST /inscriptions - Create inscription (enroll in formation)
router.post('/', requireAuth, inscriptionController.createInscription);

// GET /inscriptions/:id - Get inscription by ID
router.get('/:id', requireAuth, inscriptionController.getInscriptionById);

// PUT /inscriptions/:id/accept - Accept inscription (responsableCF only)
router.put('/:id/accept', requireAuth, requireRole('responsableCF'), inscriptionController.acceptInscription);

// PUT /inscriptions/:id/reject - Reject inscription (responsableCF only)
router.put('/:id/reject', requireAuth, requireRole('responsableCF'), inscriptionController.rejectInscription);

// DELETE /inscriptions/:id - Delete inscription
router.delete('/:id', requireAuth, requireRole('admin'), inscriptionController.deleteInscription);

module.exports = router;
