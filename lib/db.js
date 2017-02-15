// db.js

console.log('- db.js loaded'.yellow);

var mysql= require('mysql');

/*
var db = mysql.createConnection({
		    host     : '10.100.100.170',
		    user     : 'info-prj04',
		    password : 'L5L9CeWDeS7PLuta',
		    database : 'info-prj04',
		});
*/

var db = mysql.createConnection({
		    host     : 'localhost',
			port	 : '8889',
		    user     : 'root',
		    password : 'root',
		    database : 'info-prj04',
		});

module.exports = db;
