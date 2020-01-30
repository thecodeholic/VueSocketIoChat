const mysql = require('mysql');

let database, port, host;
if (process.env.DB_DSN){
  const matches = process.env.DB_DSN.match(/host=([^;]+);port=(\d+);dbname=(.+)/);
  host = matches[1];
  port = matches[2];
  database = matches[3];
} else {
  host = process.env.DB_HOST;
  port = process.env.DB_PORT;
  database = process.env.DB_NAME;
}

var connection = mysql.createConnection({
  host: host,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: database,
  port: port
});

connection.connect();

module.exports = connection;
