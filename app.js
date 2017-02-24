// app.js

// ======== GLOBAL VAR ========
global.NUM_SMS = "0769110568"; // Numéro de la carte SIM du module
global.FAKE_SMS = true; // Simulation de reception de SMS
global.SMS_MODULE =  false; // Désactiver pour test sans le module
global.DISPLAY_SMS = true; // Afficher dans la console les SMS reçus
global.DEBUG = true; // Affichage dans la console
global.session = false; // false => no session running
global.currentQuestion = false;
global.PORT = 8080;

// ======== IMPORT MODULE ========
var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var helmet = require('helmet');
var colors = require('colors');

// ======== APP ========
app.use(helmet());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

var expiryDate = new Date(Date.now() + 60 * 60 * 1000 );

app.use(session({
	secret: 'u9fdsS4d.#Zd8a/4J*',
	name : 'sesSionId478',
	cookie: { secure: false, httpOnly: true, expires: expiryDate },
	resave: false,
	saveUninitialized: true,
}));

// ======== CUSTOM MODULES ========
console.log("\nLoading custom modules:".yellow);
var db = require('./lib/db');
var dataAccess = require('./lib/dataAccess');
var routes = require('./lib/router')(app);
var functions = require('./lib/functions');
var io_route = require('./lib/sockets')(http);
var sms = require('./lib/sms')("test");

// ============ SESSION QUESTIONNAIRE CHECK ============
functions.isAnySessionOpen(function(res){
	if (res !== false){
		for (var sess in res) { // Si plusieurs sessions actives
			dataAccess.reqStopSession(res[sess].ID_SESSION, function(){
				if (global.DEBUG) {	console.log("Une session de questionnaire est active au lancement, réinitialisation de son status actif ID_SESSION: " + res[sess].ID_SESSION);
				}
			});
		}
	}
});

if (global.DEBUG) {
	setInterval(function(){
		console.log("CurrentSession : " + global.session);
		console.log("CurrentQuestion : " + global.currentQuestion);
	}, 4000);
}


if (global.FAKE_SMS){
	setInterval( function(){
		functions.requireSMS_Add("+33600490000", "b", function(res){ });
		functions.requireSMS_Add("+33600490000", "A", function(res){ });
		functions.requireSMS_Add("+33600490300", "A", function(res){ });
		if (global.DEBUG) functions.requireSMS_Add("+33600490000", "&", function(res){ }); // Invalid content
	}, 4000);
}


// ===== SERVER ======
http.listen(global.PORT,function(){
    console.log(('\n' + "=== App Started on PORT " + global.PORT + " ===" + '\n').green);
});
