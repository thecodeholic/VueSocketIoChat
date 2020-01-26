const mysql = require('mysql');
console.log(process.env.DB_PASS);

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect();

module.exports = connection;
