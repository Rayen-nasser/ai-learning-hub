const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require('../middlewares/uploadfile');
const { requireAuth } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         role:
 *           type: string
 *           enum: [user, admin, formateur, apprenant, responsableCF]
 *           description: User role
 */

// ───────── PUBLIC ROUTES ─────────

// POST /users/register - Register new user
router.post("/register", userController.createUser);

// POST /users/register-with-image - Register with image
router.post("/register-with-image", upload.single('user_image'), userController.createUserWithImage);

// POST /users/login - User login
router.post("/login", userController.login);

// POST /users/forgot-password - Request password reset
router.post("/forgot-password", userController.forgotPassword);

// POST /users/reset-password - Reset password with token
router.post("/reset-password", userController.resetPassword);

// ───────── PROTECTED ROUTES ─────────

// POST /users/logout - User logout
router.post("/logout", requireAuth, userController.logout);

// POST /users/change-password - Change password
router.post("/change-password", requireAuth, userController.changePassword);

// GET /users - Get all users (admin only)
router.get("/", requireAuth, userController.getAllUsers);

// GET /users/me - Get my profile
router.get("/me", requireAuth, userController.getMyProfile);

// GET /users/:id - Get user by ID
router.get("/:id", requireAuth, userController.getUserById);

// PUT /users/:id - Update user
router.put("/:id", requireAuth, upload.single("user_image"), userController.updateUser);

// DELETE /users/:id - Delete user
router.delete("/:id", requireAuth, userController.deleteUser);

module.exports = router;
