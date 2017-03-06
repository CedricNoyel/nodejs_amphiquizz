// sms.js

console.log('- sms.js loaded'.yellow);

var db = require('./db');
var dataAccess = require('./dataAccess');
var functions = require('./functions');
var childProcess = require('child_process'); // POUR MODULE SMS

module.exports = function(a){
	
	var smsDaemon = childProcess.exec('sudo python ./lib/sms.py');
	smsDaemon.stdout.on('data',function(data){
		var smsParts = data.split("\t");
		functions.requireSMS_Add(smsParts[0], smsParts[2].trim(), function(res){ 
			console.log("Sms recu: " + smsParts[0] + " - " + smsParts[2].trim());
		});
	});
	smsDaemon.stderr.on('data',function(data){
		// Pour le debug, avec la ligne logging décommentée dans sms.py
	    console.log("err: "+data); 
	});

}