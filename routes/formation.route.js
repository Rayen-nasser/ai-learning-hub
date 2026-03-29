var express = require('express');
var router = express.Router();
const formationController = require('../controllers/formation.controller');

// ───────── READ (tous les roles) ─────────
router.get('/getAllFormations', formationController.getAllFormations);
router.get('/getFormationById/:id', formationController.getFormationById);

// ───────── CREATE / UPDATE / DELETE ─────────
router.post('/createFormation', formationController.createFormation);
router.put('/updateFormation/:id', formationController.updateFormation);
router.delete('/deleteFormation/:id', formationController.deleteFormation);

module.exports = router;