var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/cours.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/lecons', ctrl.getLecons);
router.get('/:id/moyenne', ctrl.getMoyenneNote);

module.exports = router;