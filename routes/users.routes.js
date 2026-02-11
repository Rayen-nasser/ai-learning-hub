var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

/* GET users listing. */
router.get('/GetAllUsers', userController.getAllUsers);

router.get('/GetUserById/:id', userController.getUserById);

router.post('/CreateUser', userController.createUser);

router.post('/CreateUserAdmin', userController.createUserAdmin);

router.post('/CreateUserModerateur', userController.createUserModerateur);

router.delete('/deleteUser/:id', userController.deleteUser);

router.put('/updateUser/:id', userController.updateUser);


module.exports = router;
