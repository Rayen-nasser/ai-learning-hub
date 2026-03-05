var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/paiement.controller');

router.get('/methodes',         ctrl.getMethodes);    // Méthodes TN disponibles

router.get('/',                 ctrl.getAll);
router.get('/:id',              ctrl.getById);
router.post('/',                ctrl.create);
router.delete('/:id',           ctrl.remove);

router.put('/:id/valider',      ctrl.valider);
router.put('/:id/rembourser',   ctrl.rembourser);
router.put('/:id/annuler',      ctrl.annuler);

module.exports = router;