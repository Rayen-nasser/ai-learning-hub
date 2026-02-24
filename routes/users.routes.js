var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

// ================= CREATE =================

// CREATE normal user (apprenant par défaut)
router.post('/', userController.createUser);

// CREATE admin
router.post('/admin', userController.createUserAdmin);

// CREATE formateur
router.post('/formateur', userController.createUserFormateur);

// CREATE apprenant
router.post('/apprenant', userController.createUserApprenant);


// ================= READ =================

// GET all users
router.get('/', userController.getAllUsers);

// GET user by id (mettre toujours en dernier des GET dynamiques)
router.get('/:id', userController.getUserById);


// ================= UPDATE =================
router.put('/:id', userController.updateUser);


// ================= DELETE =================
router.delete('/:id', userController.deleteUser);

module.exports = router;