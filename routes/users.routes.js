const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller"); // Make sure this path is correct
const upload = require('../middlewares/uploadfile'); // Middleware pour gérer les uploads de fichiers
const logMiddleware = require('../middlewares/LogMiddleware');

// ───── REGISTER ─────
router.post("/register", userController.createUser);

// ───── CREATE SPECIFIC USERS ─────
router.post("/create-admin", userController.createAdmin);
router.post("/create-trainer", userController.createTrainer);
router.post("/create-center-manager", userController.createCenterManager);
router.post('/CreateUser', userController.createUser);
router.post('/CreateUserWithImage', upload.single('user_image'), userController.createUserWithImage);

// ───── GET USERS ─────
router.get("/getAllUsers",logMiddleware, userController .getAllUsers);
router.get("/:id", logMiddleware, userController.getUserById);

// ───── UPDATE & DELETE ─────
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// ───── AUTH ─────
router.post("/login",logMiddleware, userController.login);
router.post("/logout", userController.logout);
router.post("/forgot-password", userController.forgotPassword);

module.exports = router;