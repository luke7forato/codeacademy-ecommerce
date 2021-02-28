const Pool = require('pg').Pool;
const dotenv = require('dotenv').config();



const pool = new Pool({
    user: "postgres",
    password: process.env.DB_PASS,
    database: "ecommerce_idea",
    host: "localhost",
    port: 5432
});

module.exports = pool;