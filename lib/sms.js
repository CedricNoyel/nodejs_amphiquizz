// sms.js

console.log('- sms.js loaded'.yellow);

var db = require('./db');
var dataAccess = require('./dataAccess');
var functions = require('./functions');
var childProcess = require('child_process'); // POUR MODULE SMSvar

module.exports = function(a){
	var smsDaemon = childProcess.exec('sudo usb_modeswitch -b2 -W -v 12d1 -p 1446 -n --message-content 555342437f0000000002000080000a11062000000000000100000000000000');

	var smsDaemon = childProcess.exec('python ./lib/sms.py');

	smsDaemon.stdout.on('data',function(data){
		var smsParts = data.split("\t");
		functions.requireSMS_Add(smsParts[0], smsParts[2].trim(), function(res){ 
			console.log("Sms recu: " + smsParts[0] + " - " + smsParts[2].trim());
		});
	});

	smsDaemon.stderr.on('data',function(data){
		// Pour le debug, avec la ligne logging décommentée dans sms.py
	    console.log("err: "+data);
	    /*
	    if (global.SMS_MODULE){
	    	for (var a=0; a<5; a++){
	    		console.log("! No sms device found ! Reboot system !".red);
	    	}

		    setTimeout(function() {
				console.log("Arret ...");
				require('child_process').exec('reboot', console.log); // REBOOT SYSTEM
	        }, 5000);
			
	    } else {
	    	console.log("<!> SMS MODULE variable is turned OFF <!>".red);
	    }
			*/
	});

}