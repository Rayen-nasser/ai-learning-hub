const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require('../middlewares/uploadfile');
const logMiddleware = require('../middlewares/LogMiddleware');
const { requireAuth } = require('../middlewares/authMiddleware'); // ✅ requireAuth

// ───── CREATE USERS ─────
router.post("/register", userController.createUser);
router.post("/registerWithImage", upload.single('user_image'), userController.createUserWithImage);

// ───── GET USERS ─────
router.get("/getAllUsers", requireAuth, logMiddleware, userController.getAllUsers);
router.get("/getMyProfile", requireAuth, userController.getMyProfile);

// ───── AUTH ─────
router.post("/login", logMiddleware, userController.login);
router.post("/logout", requireAuth, userController.logout);
router.post("/forgot-password", userController.forgotPassword);

// ───── ID ROUTE (doit être en dernier) ─────
router.get("/:id", requireAuth, logMiddleware, userController.getUserById);
router.put("/:id", requireAuth, userController.updateUser);
router.delete("/:id", requireAuth, userController.deleteUser);

module.exports = router;