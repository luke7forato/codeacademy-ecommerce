const router = require('express').Router();
const pool = require('../db')
const verify = require('../verifyToken')

/**
 * @swagger
 * /api/orders/new:
 *   post:
 *     tags:
 *       - Orders
 *     description: Creates a new Order ad deletes items from cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - address: user's address
 *         credit_card: user's credit card
 *     responses:
 *       200:
 *         description: order posted successfully
 */
router.post('/new', verify, async(req, res) => {
    //GET ALL ORDERS FROM USER
    const userID = req.user._id;

    try {
        //GET ALL CART PRODUCTS
        const userCart = await pool.query("SELECT * FROM user_products WHERE user_id = ($1)", [userID]);
        const array = userCart.rows;


        //ADD ALL PRODUCTS TO CART
        array.forEach(element => {
            pool.query("INSERT INTO orders (user_id, product_id, quantity, address, credit_card) VALUES ($1, $2, $3, $4, $5) RETURNING *", [userID, element.product_id, element.quantity, req.body.address, req.body.credit_card])
            pool.query("DELETE FROM user_products WHERE user_id = ($1)", [userID]);
        });
        res.send("order posted successfully.")
    } catch(err) {
        res.status(400).send(err)
    }

})

/**
 * @swagger
 * /api/orders/get-all:
 *   get:
 *     tags:
 *       - Cart
 *     description: Returns all the orders from a specific user
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header) 
 *     responses:
 *       200:
 *         description: JSON with all orders
 */
router.get('/get-all', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    try {
        //GET ALL ORDERS FROM USERID
        const allOrders = await pool.query("SELECT * FROM orders WHERE user_id = ($1)", [userID]);
        res.send(allOrders.rows)
    } catch(err) {
        res.status(400).send(err)
    }
})

/**
 * @swagger
 * /api/orders/change:
 *   put:
 *     tags: Orders
 *     description: Updates the quantity of a specific order
 *     produces: application/json
 *     parameters:
 *       token: JWT token (header)
 *       name: name of product to find
 *       quantity: new quantity of items
 *     responses:
 *       200:
 *         description: JSON with updated order
 */
router.put('/change', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    try {
        //GET ORDER ID BY NAME
        const order = await pool.query("SELECT * FROM orders JOIN products ON orders.product_id = products.id WHERE orders.user_id = ($1) AND products.name = ($2)", [userID, req.body.name])
        const orderID = order.rows[0].product_id;

        //CHANGE QUANTITY
        const changedQuantity = await pool.query("UPDATE orders SET quantity = ($1) WHERE user_id = ($2) AND product_id = ($3) RETURNING *", [req.body.quantity, userID, orderID]);
        res.send(changedQuantity.rows)

    } catch(err) {
        res.status(400).send(err)
    }
})

/**
 * @swagger
 * /api/orders/delete-one:
 *   delete:
 *     tags:
 *       - Orders
 *     description: Delete a single order
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *         name: name of the product in the order to be deleted
 *     responses:
 *       200:
 *         description: JOSN with deleted order
 */
router.delete('/delete-one', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    try {
        //GET ORDER ID BY NAME
        const order = await pool.query("SELECT * FROM orders JOIN products ON orders.product_id = products.id WHERE orders.user_id = ($1) AND products.name = ($2)", [userID, req.body.name])
        const orderID = order.rows[0].product_id;

        //DELETE ORDER
        const deletedOrder = await pool.query("DELETE FROM orders WHERE user_id = ($1) AND product_id = ($2) RETURNING *", [userID, orderID])
        res.send(deletedOrder.rows)
    } catch(err) {
        res.status(400).send(err)
    }
})

/**
 * @swagger
 * /api/orders/delete-all:
 *   delete:
 *     tags:
 *       - Orders
 *     description: Delete all orders from a specific user
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *     responses:
 *       200:
 *         description: JOSN with all deleted orders
 */
router.delete('/delete-all', verify, async(req, res) => {
    //GET USER ID
    const userID = req.user._id;

    try {
        //DELETE ORDERS
        const deletedOrders = await pool.query("DELETE FROM orders WHERE user_id = ($1) RETURNING *", [userID])
        res.send(deletedOrders.rows)
    } catch(err) {
        res.status(400).send(err)
    }
})


module.exports = router;