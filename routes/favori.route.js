var express = require('express');
var router = express.Router();
const favoriController = require('../controllers/favori.controller');

// ───────── READ ─────────
router.get('/getAllFavoris', favoriController.getAllFavoris);
router.get('/getFavorisByApprenant/:apprenantId', favoriController.getFavorisByApprenant);

// ───────── CREATE / DELETE ─────────
router.post('/createFavori', favoriController.createFavori);
router.delete('/deleteFavori/:id', favoriController.deleteFavori);

module.exports = router;