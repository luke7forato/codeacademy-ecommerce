const router = require('express').Router();
const pool = require('../db')
const { required } = require('joi');
const verify = require('../verifyToken')
const bcrypt = require('bcrypt')
const newInfoValidation = require('../validation/newInfoVal')


/**
 * @swagger
 * /api/user/modify/email:
 *   put:
 *     tags: ModifyUser
 *     description: Updates the email of a user
 *     produces: application/json
 *     parameters:
 *       token: JWT token (header)
 *       email: New email
 *     responses:
 *       200:
 *         description: JSON with new email
 */
router.put('/email', verify, async(req, res) => {

    //VALIDATE NEW EMAIL
    const validation = newInfoValidation(req.body);
    if(validation) return res.send(validation.details[0].message)


    //CHANGE USER EMAIL
    const id = req.user._id;
    const email = await pool.query("UPDATE users SET email = ($1) WHERE id = ($2) RETURNING *", [req.body.email, id])
    res.send(email)
    

})

/**
 * @swagger
 * /api/user/modify/password:
 *   put:
 *     tags: ModifyUser
 *     description: Updates the password of a user
 *     produces: application/json
 *     parameters:
 *       token: JWT token (header)
 *       password: New password
 *     responses:
 *       200:
 *         description: JSON with new password
 */
router.put('/password', verify, async(req, res) => {
    
    const id = req.user._id;

    //VALIDATE NEW PASSWORD
    const validation = newInfoValidation(req.body);
    if(validation) return res.send(validation.details[0].message)


    //PASSWORD HASHING
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    //CHANGE PASSWORD
    const password = await pool.query("UPDATE users SET password = ($1) WHERE id = ($2) RETURNING *", [hashedPassword, id])
    res.send(password)
});

/**
 * @swagger
 * /api/user/modify/name:
 *   put:
 *     tags: ModifyUser
 *     description: Updates the name of a user
 *     produces: application/json
 *     parameters:
 *       token: JWT token (header)
 *       email: New name
 *     responses:
 *       200:
 *         description: JSON with new name
 */
router.put('/name', verify, async(req, res) => {
    
    const id = req.user._id;

    //VALIDATE NEW CPF
    const validation = newInfoValidation(req.body);
    if(validation) return res.send(validation.details[0].message)
    
    //CHANGE CPF
    const name = await pool.query("UPDATE users SET name = ($1) WHERE id = ($2) RETURNING *", [req.body.name, id])
    res.send(name)
});


/**
 * @swagger
 * /api/user/modify/delete-one:
 *   delete:
 *     tags:
 *       - ModifyUser
 *     description: Delete a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - token: JWT token (header)
 *         email: email of the user to be deleted
 *     responses:
 *       200:
 *         description: JOSN with deleted user
 */
router.delete('/delete', verify, async(req, res) => {
    //GET ID
    const id = await pool.query("SELECT id FROM users WHERE email = ($1)", [req.body.email])
    console.log(id.rows[0].id);
    try {
        const deletedAccount = await pool.query("DELETE FROM users WHERE id = ($1) RETURNING *", [id.rows[0].id])
        res.send(deletedAccount)
    } catch(err) {
        res.status(404).send("Something went wrong, please try again later.")
    }
})




module.exports = router;