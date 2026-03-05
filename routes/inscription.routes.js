var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/inscription.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);
router.put('/:id/confirmer', ctrl.confirmer);
router.put('/:id/annuler', ctrl.annuler);
router.get('/:id/paiement', ctrl.getPaiement);

module.exports = router;