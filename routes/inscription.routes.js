var express = require('express');
var router = express.Router();
const inscriptionController = require('../controllers/inscription.controller');

// ───────── READ ─────────
router.get('/getAllInscriptions', inscriptionController.getAllInscriptions);
router.get('/getInscriptionById/:id', inscriptionController.getInscriptionById);

// ───────── CREATE ─────────
router.post('/createInscription', inscriptionController.createInscription);

// ───────── VALIDER / ANNULER ─────────
router.put('/validerInscription/:id', inscriptionController.validerInscription);
router.put('/annulerInscription/:id', inscriptionController.annulerInscription);

// ───────── DELETE ─────────
router.delete('/deleteInscription/:id', inscriptionController.deleteInscription);

module.exports = router;