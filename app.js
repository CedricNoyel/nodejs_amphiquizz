// app.js

var express = require('express');
var app = express(); 
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var io_route = require('./lib/sockets')(http);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + "/public"));
app.use(session({
	secret: 'u9fdsS4d.#Zd8a/4J*',
	resave: false,
	saveUninitialized: true,
}));

var db = require('./lib/db');
var dataAccess = require('./lib/dataAccess');
var routes = require('./lib/router')(app);
var functions = require('./lib/functions');



// ===== SERVER ====== 
http.listen(8080,function(){
    console.log('\n' + "=== App Started on PORT 8080 ===".green + '\n');
});