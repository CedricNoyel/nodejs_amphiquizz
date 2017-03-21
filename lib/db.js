// db.js

console.log('- db.js loaded'.yellow);

var mysql = require('mysql');

var db = mysql.createConnection({
		    host     : 'localhost',
		    port     : '3306',
		    user     : 'root',
		    password : 'raspberry',
		    database : 'infoprj04',
		});

module.exports = db;
