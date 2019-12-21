const mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'socket_io_chat'
});

connection.connect();

module.exports = connection;
