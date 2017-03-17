// app.js

// ======== GLOBAL VAR ========
global.NUM_SMS = "0769110568"; // Numéro de la carte SIM du module
global.FAKE_SMS = true; // Simulation de reception de SMS
global.SMS_MODULE =  true; // Désactiver pour test sans le module
global.DISPLAY_SMS = true; // Afficher dans la console les SMS reçus
global.DEBUG = false; // Affichage dans la console
global.session = false; // false => no session running
global.currentQuestion = false;
global.appelEnCours = false;
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
		console.log("CurrentSession : " + global.session + " - CurrentQuestion : " + global.currentQuestion + " - AppelEncours : " + global.appelEnCours);
	}, 4000);
}
var numtel = 33600490000;

if (global.FAKE_SMS){
	setInterval( function(){
		numtel++;
		if (global.currentQuestion !== false) { // TEST SMS QUESTIONNAIRE
			functions.requireSMS_Add("+" + numtel, "B", function(res){ });
			functions.requireSMS_Add("+33600490020", "B", function(res){ });
			functions.requireSMS_Add("+33636490020", "C", function(res){ });
			functions.requireSMS_Add("+33634490020", "A", function(res){ });
			functions.requireSMS_Add("+33600490000", "&", function(res){ }); // Invalid content
			functions.requireSMS_Add("+33600490300", "Z", function(res){ });
		} else if (global.appelEnCours !== false) { // TEST APPEL
			functions.requireSMS_Add("+33600490020", "b", function(res){ });
			functions.requireSMS_Add("+33600490300", "NOYEL", function(res){ });
			functions.requireSMS_Add("+33600490300", "CEDric", function(res){ });
			functions.requireSMS_Add("+33600490300", "6ASJJ", function(res){ });
			functions.requireSMS_Add("+33600490300", "KINGSLEY-BALANDRA", function(res){ });
			functions.requireSMS_Add("+33600490300", "NOYEL_dsq", function(res){ });
			functions.requireSMS_Add("+33600490300", "noyel", function(res){ });
			functions.requireSMS_Add("+33600490300", ".fqfsjq", function(res){ });
			functions.requireSMS_Add("+33600490300", "?cwx", function(res){ });

			functions.requireSMS_Add("+33600490300", "NOYEL", function(res){ });
			functions.requireSMS_Add("+33600490300", "sfv", function(res){ });
			functions.requireSMS_Add("+33600490300", "NOYtbertbEL", function(res){ });
			functions.requireSMS_Add("+33600490300", "NOYzerzerfEL", function(res){ });
			functions.requireSMS_Add("+33600490300", "azef", function(res){ });
			functions.requireSMS_Add("+33600490300", "NOYzergergEL", function(res){ });
		}
	}, 4000);
}


// ===== SERVER ======
http.listen(global.PORT,function(){
    console.log(('\n' + "=== App Started on PORT " + global.PORT + " ===" + '\n').green);
});
