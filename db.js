// db.js

var mysql= require('mysql');
console.log('db.js loaded');

module.exports.set = function(){


	var db = mysql.createConnection({ // Mysql Connection
	    host     : '10.100.100.170',
	    user     : 'info-prj04',
	    password : 'L5L9CeWDeS7PLuta',
	    database : 'info-prj04',
	});
	
	return db;


};