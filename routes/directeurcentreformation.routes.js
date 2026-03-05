var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/directeurcentreformation.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/formations', ctrl.getFormations);
router.get('/:id/formateurs', ctrl.getFormateurs);

module.exports = router;