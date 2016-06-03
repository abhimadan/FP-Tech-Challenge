var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'freshprints-challenge.ci008uhawggf.us-west-2.rds.amazonaws.com',
  user     : 'fp_quoter',
  password : 'password',
  database : 'main_db'
});

connection.connect();

exports.connection = connection;
