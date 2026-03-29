var express = require('express');
var router = express.Router();
const paiementController = require('../controllers/paiement.controller');

// ───────── READ ─────────
router.get('/getAllPaiements', paiementController.getAllPaiements);
router.get('/getPaiementById/:id', paiementController.getPaiementById);

// ───────── CREATE ─────────
router.post('/createPaiement', paiementController.createPaiement);

// ───────── CONFIRMER ─────────
router.put('/confirmerPaiement/:id', paiementController.confirmerPaiement);

// ───────── DELETE ─────────
router.delete('/deletePaiement/:id', paiementController.deletePaiement);

module.exports = router;