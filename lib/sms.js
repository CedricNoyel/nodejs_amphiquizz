// sms.js

console.log('- sms.js loaded'.yellow);

var db = require('./db');
var dataAccess = require('./dataAccess');
var functions = require('./functions');
var childProcess = require('child_process'); // POUR MODULE SMS

module.exports = function(a){
	/*
	functions.isAnySessionOpen(function(res){
		console.log(res);
	});
	*/
	/*
	if (global.SMS_MODULE)
	{
		console.log("Activating SMS Device".green);
		var smsReceived = [];
		var smsDaemon = childProcess.exec('sudo python ./lib/sms.py');
		smsDaemon.stdout.on('data',function(data){
			var smsParts = data.split("\t");
			smsReceived.push({ from: smsParts[0], date: smsParts[1], content: smsParts[2].trim() });

			functions.requireSMS_Add(smsParts[0], smsParts[2].trill(), function(res){ 
				console.log(smsReceived.yellow);
			});
		});

		smsDaemon.stderr.on('data',function(data){
			// Pour le debug, avec la ligne logging décommentée dans sms.py
		    console.log("err: " + data); 
		});

	} else {
		console.log("App is running without SMS device : SMS_MODULE = FALSE in app.js".red);
	}
	*/
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