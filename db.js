const Pool = require('pg').Pool;
const dotenv = require('dotenv').config();
var file = require('file-system');
var fs = require('fs');
file.readFile === fs.readFile // true

const pool = new Pool({
    user: "jmjdlkkeolfonv",
    password: process.env.DB_PASS,
    database: "deeds315ndkpik",
    host: "ec2-52-70-67-123.compute-1.amazonaws.com",
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

pool.connect();

module.exports = pool;