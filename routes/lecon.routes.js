var express = require('express');
var router = express.Router();
const leconController = require('../controllers/lecon.controller');

// ───────── READ (tous les roles) ─────────
router.get('/getAllLecons', leconController.getAllLecons);
router.get('/getLeconById/:id', leconController.getLeconById);

// ───────── CREATE / UPDATE / DELETE ─────────
router.post('/createLecon', leconController.createLecon);
router.put('/updateLecon/:id', leconController.updateLecon);
router.delete('/deleteLecon/:id', leconController.deleteLecon);

module.exports = router;