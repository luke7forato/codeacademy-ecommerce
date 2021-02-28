const router = require('express').Router();
const pool = require('../db')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const registrationValidation = require('../validation/registrationVal')
const loginValidation = require('../validation/loginVal')
const bcrypt = require('bcrypt');
var swaggerJSDoc = require('swagger-jsdoc');



/**
 * @swagger
 * /api/user/register:
 *   post:
 *     tags:
 *       - Registration
 *     description: Creates a new User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user name
 *         email: user email
 *         password: user password
 *     responses:
 *       200:
 *         description: JSON of new user
 */

router.post('/register', async(req, res) => {

    //VALIDATION
    const validation = registrationValidation(req.body);
    console.log(req.body);
    if(validation) return res.send(validation.details[0].message)

    //PASSWORD HASHING
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {
        const newUser = await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING*", [req.body.name, req.body.email, hashedPassword])
        return res.status(200).send(newUser)
    } catch(error) {
        if(error.code == 23505) return res.send("Email already in use.")
        return res.send(error)
    }
})

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags:
 *       - Login
 *     description: Authenticates and logs in
 *     produces:
 *       - JWT token
 *     parameters:
 *       - email: user email
 *         password: user password
 *     responses:
 *       200:
 *         JWT token
 */
router.post('/login', async(req, res) => {

    //VALIDATION
    const validation = loginValidation(req.body);
    if(validation) return res.send(validation.details[0].message);

    //CHECK IF EMAIL EXISTS
    const account = await pool.query("SELECT * FROM users WHERE email = ($1)", [req.body.email])
    if(!account.rows[0]) return res.send("Email is invalid.")
    console.log(account);
    //CHECK IF PASSWORD MATCHES
    const checkedPassword = await bcrypt.compare(req.body.password, account.rows[0].password)
    if(!checkedPassword) return res.status(400).send("Password is invalid.")
    

    //CREATE AND ASSIGN TOKEN
    const token = jwt.sign({_id: account.rows[0].id}, process.env.TOKEN_SECRET);
    return res.header('token', token).send(token)
})


module.exports = router;


