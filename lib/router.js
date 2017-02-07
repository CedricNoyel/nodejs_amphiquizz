// router.js

console.log('- router.js loaded'.yellow);

var fs = require('fs');
var functions = require('./functions');
var dataAccess = require('./dataAccess');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

module.exports = function(app){

	app.get('/', [functions.notLogged], function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/login.html').toString());
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

	app.post('/register', function(req, res){
		functions.checkRegister(req.body.name, req.body.firstname, req.body.login, req.body.password1, req.body.password2, function(error){
			if (error=="0"){ 
				res.redirect('/');
			} else {
				res.redirect('/register');
			}
		});
	});

	app.get('/logout',function(req,res){ req.session.destroy(function() { res.redirect('/'); }); });

	app.get('/admin', [functions.requireLogin], function(req, res){
		var sess = req.session;
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

	app.get('/stats/:id', [functions.requireLogin], [functions.checkIdQuestionnaire], function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/stats.html').toString());
	});

	app.get('/fastquestion/:id', [functions.requireLogin], [functions.checkIdQuestion], function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/questionrapide.html').toString());
	});

	app.get('/launched/:id', [functions.requireLogin], function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/launched.html').toString());
	});

	app.get('/register', function(req, res){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(fs.readFileSync('./view/register.html').toString());
	});

	app.use(function(req, res){
	    res.writeHead(200, {"Content-Type": "text/html"});
	    res.end(fs.readFileSync('./view/404error.html').toString());
	});
	
}