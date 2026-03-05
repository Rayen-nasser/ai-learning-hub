var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

// ================= CREATE =================
router.post('/',                        userController.createUser);
router.post('/admin',                   userController.createUserAdmin);
router.post('/formateur',               userController.createUserFormateur);
router.post('/apprenant',               userController.createUserApprenant);
router.post('/directeur',               userController.createUserDirecteur); // ✅ NOUVEAU

// ================= READ =================
router.get('/',                         userController.getAllUsers);
router.get('/:id',                      userController.getUserById);

// ================= UPDATE =================
router.put('/:id',                      userController.updateUser);

// ================= DELETE =================
router.delete('/:id',                   userController.deleteUser);

module.exports = router;