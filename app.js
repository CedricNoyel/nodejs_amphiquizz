// app.js

var SMS_MODULE =  false; // Désactiver pour test sans le module
var DISPLAY_SMS = true; // Afficher dans la console les SMS reçus
var DEBUG = false;

var express = require('express');
var app = express(); 
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var io_route = require('./lib/sockets')(http);
var helmet = require('helmet');
var childProcess = require('child_process'); // POUR MODULE SMS


app.use(helmet());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + "/public"));

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 );

app.use(session({
	secret: 'u9fdsS4d.#Zd8a/4J*',
	name : 'sesSionId478',
	cookie: { secure: false,
			  httpOnly: true,
			  expires: expiryDate },
	resave: false,
	saveUninitialized: true,
}));

var db = require('./lib/db');
var dataAccess = require('./lib/dataAccess');
var routes = require('./lib/router')(app);
var functions = require('./lib/functions');


// SMS HANDLE
if (SMS_MODULE)
{
	console.log("Activating SMS Device".green);
	var smsReceived = [];
	var smsDaemon = childProcess.exec('sudo python sms.py');
	smsDaemon.stdout.on('data',function(data){
		var smsParts = data.split("\t");
		smsReceived.push({ from: smsParts[0], date: smsParts[1], content: smsParts[2].trim() });

		functions.requireSMS_Add(smsReceived[0].from, smsReceived[0].content, function(res){ 
			if (DISPLAY_SMS) console.log(smsReceived.yellow);
			console.log("SMS Entre en base");
		}); 
	});

	smsDaemon.stderr.on('data',function(data){
		// Pour le debug, avec la ligne logging décommentée dans sms.py
	    // console.log("err: " + data); 
	});

} else {
	console.log("App is running without SMS device !".red);
	functions.requireSMS_Add("+33649713933", "Hello world !", function(res){ /* Ajout a la base de donnee */ }); 
	functions.requireSMS_Add("+33649713999", "Hello world !", function(res){ /* Ajout a la base de donnee */ }); 
	functions.requireSMS_Add("+33649714242", "Hello world !", function(res){ /* Ajout a la base de donnee */ }); 
	functions.requireSMS_Add("+33649710938", "Hello world !", function(res){ /* Ajout a la base de donnee */ }); 
	functions.requireSMS_Add("+33749716322", "Hello world !", function(res){ /* Ajout a la base de donnee */ }); 
}



// ===== SERVER ====== 
http.listen(8080,function(){
    console.log('\n' + "=== App Started on PORT 8080 ===".green + '\n');
});