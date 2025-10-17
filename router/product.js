const { createProduct, getAll, getOne } = require('../controllers/product');
const { authenticate, adminAuth } = require('../middleware/authentication');

const router = require('express').Router();

/**
 * @swagger
 * /api/v1/create-product:
 *   post:
 *     summary: Create a new product
 *     description: Adds a new product to the database. This route requires admin authentication.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - price
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "Chicken Burger"
 *               price:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 670f12e50a5a9e6d239e4b9a
 *                     productName:
 *                       type: string
 *                       example: Chicken Burger
 *                     price:
 *                       type: number
 *                       example: 3500
 *       400:
 *         description: Product already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product already exists
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Only admins can create products
 *       500:
 *         description: Internal server error
 */
router.post('/create-product', authenticate, adminAuth, createProduct);


/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     description: Fetch all available products from the database.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: A list of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All products
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 670f12e50a5a9e6d239e4b9a
 *                       productName:
 *                         type: string
 *                         example: Chicken Burger
 *                       price:
 *                         type: number
 *                         example: 2500
 *       500:
 *         description: Internal server error
 */
router.get('/products', getAll);


/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a single product
 *     description: Retrieve a specific product by its unique ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the product to retrieve
 *         schema:
 *           type: string
 *           example: 670f12e50a5a9e6d239e4b9a
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 670f12e50a5a9e6d239e4b9a
 *                     productName:
 *                       type: string
 *                       example: Chicken Burger
 *                     price:
 *                       type: number
 *                       example: 2500
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/products/:id', getOne);

module.exports = router;