var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

// ───────── AUTH ─────────
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/forgotPassword', userController.forgotPassword);
router.put('/changePassword/:id', userController.changePassword);

// ───────── PROFILE ─────────
router.get('/getMyProfile', userController.getMyProfile);
// router.put('/uploadPhoto/:id', upload.single('photodeprofil'), userController.uploadPhoto);

// ───────── ADMIN ─────────
router.get('/getAllUsers', userController.getAllUsers);
router.get('/getUserById/:id', userController.getUserById);
router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);
router.put('/blockUser/:id', userController.blockUser);
router.put('/unblockUser/:id', userController.unblockUser);

module.exports = router;