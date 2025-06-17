const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'api_cult_test',
  port: 3306,
  charset: 'utf8mb4'
});

module.exports = db; 