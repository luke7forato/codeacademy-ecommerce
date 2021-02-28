const router = require('express').Router();
const pool = require('../db')
const { required } = require('joi');
const verify = require('../verifyToken')
const productsValidation = require('../validation/productsVal')
const changeProductValidation = require('../validation/changeProductVal')


/**
 * @swagger
 * /api/products/get-all:
 *   get:
 *     tags:
 *       - Cart
 *     description: Returns all orders from a specific user
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header) 
 *     responses:
 *       200:
 *         description: JSON with all products
 */
router.get('/get-all', verify, async(req, res) => {
    //GET ALL PRODUCTS
    try {
        const products = await pool.query("SELECT * FROM products");
        res.send(products.rows)
    }catch(err) {
        res.status(400).send(err)
    }
})

/**
 * @swagger
 * /api/products/new:
 *   post:
 *     tags:
 *       - Products
 *     description: Creates a new Product
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product's name
 *         description: product's description
 *         price: product's price
 *     responses:
 *       200:
 *         description: JSON new product
 */
router.post('/new', verify, async(req, res) => {
    //VALIDATE NEW PRODUCT
    const validation = productsValidation(req.body);
    if(validation) return res.send(validation.details[0].message)

    try {
        //ADD NEW PRODUCT
        const newProduct = await pool.query("INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING*", [req.body.name, req.body.description, req.body.price])
        res.send(newProduct)
    } catch(err) {
        res.status(400).send(err)
    }
})

/**
 * @swagger
 * /api/products/get-one:
 *   get:
 *     tags:
 *       - Cart
 *     description: Returns one order from a specific user
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header) 
 *         name: product you want to find
 *     responses:
 *       200:
 *         description: JSON with the product you want to find
 */
router.get('/get-one', verify, async(req, res) => {
    try {
        //GET ONE PRODUCT
        const product = await pool.query("SELECT * FROM products WHERE name = ($1)", [req.body.name]);
        if(!product.rows[0]) return res.status(404).send("Product not found")
        res.send(product.rows[0])
    } catch(err) {
        res.status(400).send(err)
    }

})

/**
 * @swagger
 * /api/products/change:
 *   put:
 *     tags: Products
 *     description: Updates info of a product
 *     produces: application/json
 *     parameters:
 *       token: JWT token (header)
 *       name: current name of product
 *       newName: new product name
 *       newDescription: new product description
 *       newPrice: new product price
 *     responses:
 *       200:
 *         description: Product updated successfully.
 */
router.put('/change', verify, async(req, res) => {
    //VALIDATION
    const validation = changeProductValidation(req.body);
    if(validation) return res.send(validation.details[0].message)

    try {
        //GET ID
        const id = await pool.query("SELECT id FROM products WHERE name = ($1)", [req.body.name])
        //CHANGE INFO
        const changedProduct = await pool.query("UPDATE products SET name = ($1) WHERE id = ($2) RETURNING *", [req.body.newName, id.rows[0].id]).then(() => {
            pool.query("UPDATE products SET description = ($1) WHERE id = ($2) RETURNING *", [req.body.newDescription, id.rows[0].id])
            pool.query("UPDATE products SET price = ($1) WHERE id = ($2) RETURNING *", [req.body.newPrice, id.rows[0].id])
        })

        //SEND NEW BOOK TO USER
        res.status(200).send("Product updated successfully.")

    } catch(err) {
        res.status(404).send("Something went wrong, please try again later.")

    }

})


/**
 * @swagger
 * /api/products/delete:
 *   delete:
 *     tags:
 *       - Orders
 *     description: Delete a single product
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *         name: name of the product to be deleted
 *     responses:
 *       200:
 *         description: JOSN with deleted product
 */
router.delete('/delete', verify, async(req, res) => {
    //GET ID
    const id = await pool.query("SELECT id FROM products WHERE name = ($1)", [req.body.name])
    console.log(id.rows[0].id);
    try {
        const deletedProduct = await pool.query("DELETE FROM products WHERE id = ($1) RETURNING *", [id.rows[0].id])
        res.send(deletedProduct)
    } catch(err) {
        res.status(404).send("Something went wrong, please try again later.")
    }
})

module.exports = router;