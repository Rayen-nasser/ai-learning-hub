var express = require('express');
var router = express.Router();
const categorieController = require('../controllers/categorie.controller');

// ───────── READ (tous les roles) ─────────
router.get('/getAllCategories', categorieController.getAllCategories);
router.get('/getCategorieById/:id', categorieController.getCategorieById);

// ───────── CREATE / UPDATE / DELETE (admin uniquement) ─────────
router.post('/createCategorie', categorieController.createCategorie);
router.put('/updateCategorie/:id', categorieController.updateCategorie);
router.delete('/deleteCategorie/:id', categorieController.deleteCategorie);

module.exports = router;