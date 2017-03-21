// app.js

// ======== GLOBAL VAR ========
global.FAKE_SMS = false; // Simulation de reception de SMS
global.SMS_MODULE =  true; // Si true, le module doit être branché
global.DISPLAY_SMS = true; // Afficher dans la console les SMS reçus
global.PORT = 8080; // Port d'écoute
global.DEBUG = false; // Pleins de trucs dans la console


global.session = false; // INITIALISATION NE PAS MODIFIER
global.currentQuestion = false; // INITIALISATION NE PAS MODIFIER
global.appelEnCours = false; // INITIALISATION NE PAS MODIFIER

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


var numtel = 33600490000;
if (global.FAKE_SMS){
	setInterval( function(){
		numtel++;
		if (global.currentQuestion !== false) { // TEST SMS QUESTIONNAIRE
			functions.requireSMS_Add("+" + numtel, "B", function(res){ });
			functions.requireSMS_Add("+33600490020", "B", function(res){ });
			functions.requireSMS_Add("+33636490020", "C", function(res){ });
			functions.requireSMS_Add("+33634490020", "A", function(res){ });
			// functions.requireSMS_Add("+33600490000", "E", function(res){ });
			functions.requireSMS_Add("+33600490000", "F", function(res){ });
			functions.requireSMS_Add("+33600490000", "D", function(res){ }); // Invalid content
			functions.requireSMS_Add("+33600490300", "Z", function(res){ });
			functions.requireSMS_Add("+33600490300", "E", function(res){ });
		} else if (global.appelEnCours !== false) { // TEST APPEL
			functions.requireSMS_Add("+33600490020", "b", function(res){ });
			functions.requireSMS_Add("+33600490300", "NOYEL", function(res){ });
			functions.requireSMS_Add("+33600490300", "CEDric", function(res){ });
			functions.requireSMS_Add("+33600490300", "6ASJJ", function(res){ });
		}
	}, 4000);
}


// ===== SERVER ======
http.listen(global.PORT,function(){
    console.log(('\n' + "=== App Started on PORT " + global.PORT + " ===" + '\n').green);
});
