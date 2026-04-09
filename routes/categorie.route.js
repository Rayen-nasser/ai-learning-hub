var express = require('express');
var router = express.Router();
const categorieController = require('../controllers/categorie.controller');

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categorie'
 *     responses:
 *       201:
 *         description: Category created
 */

/**
 * @swagger
 * /categories/updateCategorie/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 */

/**
 * @swagger
 * /categories/deleteCategorie/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */

// ───────── READ (tous les roles) ─────────
router.get('/getAllCategories', categorieController.getAllCategories);
router.get('/getCategorieById/:id', categorieController.getCategorieById);

// ───────── CREATE / UPDATE / DELETE (admin uniquement) ─────────
router.post('/createCategorie', categorieController.createCategorie);
router.put('/updateCategorie/:id', categorieController.updateCategorie);
router.delete('/deleteCategorie/:id', categorieController.deleteCategorie);

module.exports = router;
