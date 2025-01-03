const mysql = require('mysql2');

const dbConfig = {
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // port: process.env.DB_PORT,
    // connectionLimit: 10,
    // waitForConnections: true,
    // ssl: {
    //   rejectUnauthorized: false
    // }
  
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'busticket'
};

const connection = mysql.createPool(dbConfig);

module.exports = connection;