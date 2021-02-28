const router = require('express').Router();
const pool = require('../db')
const verify = require('../verifyToken')
const cartValidation = require('../validation/cartVal');
const { valid } = require('joi');


/**
 * @swagger
 * /api/cart/new:
 *   post:
 *     tags:
 *       - Cart
 *     description: Adds a new product to cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *         name: product name
 *         quantity: quantity of products to add
 *     responses:
 *       200:
 *         description: cart
 */
router.post('/new', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    const validation = cartValidation(req.body);
    if(validation) return res.status(400).send(validation.details[0].message)

    try {

        //GET PRODUCT ID
        const product = await pool.query("SELECT * FROM products WHERE name = ($1)", [req.body.name]);
        if(!product.rows[0]) return res.status(404).send("Product not found")

        //LINK USER AND PRODUCT
        const cart = await pool.query("INSERT INTO user_products (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *", [userID, product.rows[0].id, req.body.quantity]);
        res.status(200).send(cart);

    } catch(err) {

        res.status(401).send(err)
    }
})

/**
 * @swagger
 * /api/cart/get-all:
 *   get:
 *     tags:
 *       - Cart
 *     description: Returns all the cart products from a specific user
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header) 
 *     responses:
 *       200:
 *         description: JSON with all products
 */
router.get('/get-all', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    try {
        //GET ALL PRODUCTS
        const products = await pool.query("SELECT * FROM user_products JOIN products ON user_products.product_id = products.id WHERE user_products.user_id = ($1)", [userID]);
        res.send(products.rows)
    } catch(err) {
        res.status(404).send(err)
    }
})

/**
 * @swagger
 * /api/cart/get-all:
 *   get:
 *     tags:
 *       - Cart
 *     description: Returns a specific item in the cart from a specific user
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *         name: name of the product to be found 
 *     responses:
 *       200:
 *         description: JSON with product
 */
router.get('/get-one', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    try {
        //GET ALL PRODUCTS FROM ONE USER AND JOIN WITH PRODUCTS TABLE
        const allProducts = await pool.query("SELECT * FROM user_products JOIN products ON user_products.product_id = products.id WHERE user_products.user_id = ($1) AND products.name = ($2)", [userID, req.body.name]);
        res.status(200).send(allProducts.rows[0])
    } catch(err) {
        res.status(404).send(err)
    }
})

/**
 * @swagger
 * /api/cart/change:
 *   put:
 *     tags: Cart
 *     description: Updates the quantity of a single cart item
 *     produces: application/json
 *     parameters:
 *       token: JWT token (header)
 *       name: name of the item to be changed
 *       quantity: New quantity
 *     responses:
 *       200:
 *         description: JSON with updated item
 */
router.put('/change', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    try {
        //GET PRODUCT ID
        const product = await pool.query("SELECT * FROM user_products JOIN products ON user_products.product_id = products.id WHERE user_products.user_id = ($1) AND products.name = ($2)", [userID, req.body.name]);

        //CHANGE PRODUCT
        const changedQuantity = await pool.query("UPDATE user_products SET quantity = ($1) WHERE user_id = ($2) AND product_id = ($3) RETURNING *", [req.body.quantity, userID, product.rows[0].id])
        res.send(changedQuantity)
        
    } catch(err) {
        res.status(404).send(err)
    }
})

/**
 * @swagger
 * /api/cart/delete-one:
 *   delete:
 *     tags:
 *       - Puppies
 *     description: Deletes a single product from cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *         name: name of the cart product to be deleted
 *     responses:
 *       200:
 *         description: JOSN with deleted product
 */
router.delete('/delete-one', verify, async(req, res) => {
    //USER ID
    const userID = req.user._id;

    try {
        //PRODUCT ID
        const product = await pool.query("SELECT * FROM user_products JOIN products ON user_products.product_id = products.id WHERE user_products.user_id = ($1) AND products.name = ($2)", [userID, req.body.name]);

        //DELETE PRODUCT
        const deletedProduct = await pool.query("DELETE FROM user_products WHERE product_id = ($1) AND user_id = ($2) RETURNING *", [product.rows[0].id, userID]);
        res.send(deletedProduct)
    }catch (err) {
        res.status(404).send(err)
    }
})

/**
 * @swagger
 * /api/cart/delete-all:
 *   delete:
 *     tags:
 *       - Puppies
 *     description: Deletes all products from cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *     responses:
 *       200:
 *         description: JOSN with deleted products
 */
router.delete('/delete-all', verify, async(req, res) => {
    //USER ID
    const userID = req.user._id;

    try {
        //DELETE PRODUCTS FROM USER
        const deletedProducts = await pool.query("DELETE FROM user_products WHERE user_id = ($1) RETURNING *", [userID]);
        res.send(deletedProducts);
    } catch(err) {
        res.status(400).send(err)
    }
})

module.exports = router;