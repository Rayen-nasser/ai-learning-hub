var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/avis.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.put('/:id/valider', ctrl.valider);
router.put('/:id/rejeter', ctrl.rejeter);

module.exports = router;