var express = require('express');
var router = express.Router();
const centreFormationController = require('../controllers/centreFormation.controller');

// ───────── READ (tous les roles) ─────────
router.get('/getAllCentres', centreFormationController.getAllCentres);
router.get('/getCentreById/:id', centreFormationController.getCentreById);

// ───────── CREATE / UPDATE (responsableCF uniquement) ─────────
router.post('/createCentre', centreFormationController.createCentre);
router.put('/updateCentre/:id', centreFormationController.updateCentre);

// ───────── DELETE (admin uniquement) ─────────
router.delete('/deleteCentre/:id', centreFormationController.deleteCentre);

// ───────── LOGO (responsableCF uniquement - upload désactivé pour le moment) ─────────
// router.put('/uploadLogo/:id', upload.single('logo'), centreFormationController.uploadLogo);

module.exports = router;