var express = require('express');
var router = express.Router();
const controller = require('../controllers/formateurPaiement.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

// ── Formateurs ──
router.get('/formateurs', requireAuth, requireRole('responsableCF'), controller.getFormateursForMyCentres);

// ── Contracts ──
router.post('/contrats', requireAuth, requireRole('responsableCF'), controller.createContrat);
router.get('/contrats', requireAuth, requireRole('responsableCF'), controller.getContrats);
router.get('/contrats/mine', requireAuth, requireRole('formateur'), controller.getMyContrats);
router.put('/contrats/:id/confirm', requireAuth, requireRole('formateur'), controller.confirmContrat);
router.put('/contrats/:id', requireAuth, requireRole('responsableCF'), controller.updateContrat);
router.delete('/contrats/:id', requireAuth, requireRole('responsableCF'), controller.deleteContrat);
router.post('/contrats/:id/assign-formation', requireAuth, requireRole('responsableCF'), controller.assignFormationToContract);

// ── Formations ──
router.get('/formations', requireAuth, requireRole('responsableCF'), controller.getMyFormations);

// ── Payments ──
router.get('/payments', requireAuth, requireRole('responsableCF'), controller.getPayments);
router.get('/payments/mine', requireAuth, requireRole('formateur'), controller.getMyPayments);
router.put('/payments/:id/pay', requireAuth, requireRole('responsableCF'), controller.payPayment);

module.exports = router;
