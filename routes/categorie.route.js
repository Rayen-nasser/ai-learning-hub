var express = require('express');
var router = express.Router();
const categorieController = require('../controllers/categorie.controller');
const { requireAuth, requireRole } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Categorie:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           description: Category name
 *         description:
 *           type: string
 *           description: Category description
 *         image:
 *           type: string
 *           description: Category image URL
 */

/**
 * @swagger
 * /categories/getAllCategories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @swagger
 * /categories/getCategorieById/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/createCategorie:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categorie'
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

/**
 * @swagger
 * /categories/updateCategorie/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categorie'
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

/**
 * @swagger
 * /categories/deleteCategorie/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

// ───────── PUBLIC ROUTES ─────────
router.get('/getAllCategories', categorieController.getAllCategories);
router.get('/getCategorieById/:id', categorieController.getCategorieById);

// ───────── PROTECTED ROUTES (Admin only) ─────────
router.post('/createCategorie', requireAuth, requireRole('admin'), categorieController.createCategorie);
router.put('/updateCategorie/:id', requireAuth, requireRole('admin'), categorieController.updateCategorie);
router.delete('/deleteCategorie/:id', requireAuth, requireRole('admin'), categorieController.deleteCategorie);

module.exports = router;
