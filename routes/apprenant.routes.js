var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/apprenant.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/inscriptions', ctrl.getInscriptions);
router.get('/:id/avis', ctrl.getAvis);

module.exports = router;