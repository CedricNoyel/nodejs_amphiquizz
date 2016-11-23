// router.js

var fs = require('fs');
var functions = require('./functions');
var dataAccess = require('./dataAccess');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

module.exports = function(app){

	app.get('/', function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/index.html').toString());
	});

	app.post('/login', function(req, res){
		var sess = req.session;
		dataAccess.findAll('PROFESSEUR', function(profList){
			functions.checkUserPass(profList, req.body.login, req.body.mdp, sess, function(logged){
				if (logged>=1) res.redirect('/admin');
				else res.redirect('/');
			});
		}); 
	});

	app.get('/logout',function(req,res){ req.session.destroy(function() { res.redirect('/'); }); });

	app.get('/admin', [functions.requireLogin], function(req, res){
	    res.writeHead(200, {"Content-Type": "text/html"});
	    res.end(fs.readFileSync('./view/admin.html').toString());
	});

	app.get('/questionnaire/:id', [functions.requireLogin], [functions.checkIdQuestionnaire], function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/questionnaire.html').toString());
	});

	app.get('/question/:id', [functions.requireLogin], [functions.checkIdQuestion], function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/question.html').toString());
	});

	app.get('/fastquestion', [functions.requireLogin], function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/questionrapide.html').toString());
	});

	app.use(function(req, res){
	    res.writeHead(200, {"Content-Type": "text/html"});
	    res.end(fs.readFileSync('./view/404error.html').toString());
	});
	
}