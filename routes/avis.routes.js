var express = require('express');
var router = express.Router();
const avisController = require('../controllers/avis.controller');

// ───────── READ ─────────
router.get('/getAllAvis', avisController.getAllAvis);
router.get('/getAvisById/:id', avisController.getAvisById);

// ───────── CREATE / UPDATE / DELETE ─────────
router.post('/createAvis', avisController.createAvis);
router.put('/updateAvis/:id', avisController.updateAvis);
router.delete('/deleteAvis/:id', avisController.deleteAvis);

module.exports = router;