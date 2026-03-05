var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/admin.controller');

router.get('/',                         ctrl.getAll);
router.get('/:id',                      ctrl.getById);
router.post('/',                        ctrl.create);
router.put('/:id',                      ctrl.update);
router.delete('/:id',                   ctrl.remove);
router.put('/:id/permissions',          ctrl.changerPermissions);
router.put('/:id/connexion',            ctrl.mettreAJourConnexion);

module.exports = router;