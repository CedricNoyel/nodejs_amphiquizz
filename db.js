// db.js

var mysql= require('mysql');
console.log('db.js loaded');

module.exports.set = function(){


	var db = mysql.createConnection({ // Mysql Connection
	    host     : 'srv-peda.iut-acy.local',
	    user     : 'noyelc',
	    password : '1kEAUI',
	    database : 'noyelc',
	});

	return db;


};