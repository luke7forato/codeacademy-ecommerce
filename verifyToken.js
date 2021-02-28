const jwt = require('jsonwebtoken');
require('dotenv');

module.exports = function (req, res, next) {
    const token = req.header('token');
    if(!token) return res.status(401).send('access denied.');
    try {
        const verify = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verify;
        console.log(req.user);
        next();
    } catch (err) {
        res.status(400).send('Invalid Token')
    }
}