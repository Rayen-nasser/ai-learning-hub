var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/formateur.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.put('/:id/rattacher', ctrl.rattacherACentre);
router.put('/:id/detacher', ctrl.detacherDuCentre);
router.get('/:id/lecons', ctrl.getLecons);

module.exports = router;