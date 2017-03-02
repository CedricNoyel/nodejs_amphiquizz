// router.js

console.log('- router.js loaded'.yellow);

var fs = require('fs');
var functions = require('./functions');
var dataAccess = require('./dataAccess');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

module.exports = function(app){

	app.get('/', [functions.notLogged], function(req, res, next) {
	  	res.render('../view/login.ejs', { 
	  		title: 'Amphiquizz - Connexion', 
	  		erreur: req.query.failed,
	  		newAcc: req.query.newAcc
	  	});
	});

	app.post('/login', function(req, res){
		var sess = req.session;
		dataAccess.findAll('PROFESSEUR', function(profList){
			functions.checkUserPass(profList, req.body.login, req.body.mdp, sess, function(logged){
				if (logged>=1) res.redirect('/admin');
				else res.redirect('/?failed=true');
			});
		});
	});

	app.post('/register', function(req, res){
		functions.checkRegister(req.body.name, req.body.firstname, req.body.login, req.body.password1, req.body.password2, function(error){
			if (error=="0"){ 
				res.redirect('/?newAcc=true');
			} else {
				res.redirect('/register?failed=true');
			}
		});
	});

	app.get('/logout',function(req,res){ 
		req.session.destroy(function() {
			res.redirect("/");
		});
	});

	app.get('/admin', [functions.requireLogin], function(req, res){
		dataAccess.findQuestionnaireByIdProf(sess.id_professeur, function(data){
  			res.render('../view/admin.ejs', {
  				title: 'Amphiquizz - Mes questionnaires',
  				h_title: 'Mes questionnaires',
  				lastname: sess.nom,
  				firstname: sess.prenom,
  				data: data
  			});
	    });
	});

	app.get('/appel', [functions.requireLogin], function(req, res){
		global.appelEnCours = false;
			res.render('../view/appel.ejs', {
  				title: 'Amphiquizz - Faire l\'appel',
  				h_title: 'Amphiquizz - Faire l\'appel',
  				lastname: sess.nom,
  				firstname: sess.prenom
  			});
	});

	app.get('/questionnaire/:id', [functions.requireLogin], [functions.checkIdQuestionnaire], function(req, res){
		var id_quest = req.params.id;
		dataAccess.findByFieldHasValue('SESSION', 'ID_QUESTIONNAIRE', id_quest, function(sessions){
			dataAccess.findByFieldHasValue('QUESTION', 'ID_QUESTIONNAIRE', id_quest, function(questions){
				dataAccess.findByFieldHasValue('QUESTIONNAIRE', 'ID_QUESTIONNAIRE', id_quest, function(questionnaire){
					res.render('../view/questionnaire.ejs', {
						title: 'Amphiquizz - Mon questionaire',
						h_title: 'Questionnaire : ',
		  				lastname: sess.nom,
		  				firstname: sess.prenom,
						sessions: sessions,
						questionnaire: questionnaire,
						questions: questions
					});
				});
			});
    	});
	});

	app.get('/question/:id', [functions.requireLogin], [functions.checkIdQuestion], function(req, res){
		var idQuestion = req.params.id;
		dataAccess.findByFieldHasValue('QUESTION', 'ID_QUESTION', idQuestion, function(question){
			dataAccess.findByFieldHasValue('REPONSE', 'ID_QUESTION', idQuestion, function(reponses){
				res.render('../view/question.ejs', {
					title: 'Amphiquizz - Mes questions',
					h_title: 'Mes questions',
	  				lastname: sess.nom,
	  				firstname: sess.prenom,
					question: question,
					reponses: reponses
				});
			});
		});		
	});

	app.get('/fastquestion/:id', [functions.requireLogin], [functions.checkIdQuestion], function(req, res){
		dataAccess.reqIdQuestionnaire(req.params.id, function(idQuestionnaire){
	    	res.render('../view/questionrapide.ejs', {
				title: 'Amphiquizz - Créer une question rapide',
				h_title: 'Question rapide',
				lastname: sess.nom,
				firstname: sess.prenom,
				idQuestion: req.params.id,
				idQuestionnaire: idQuestionnaire
			});
    	});	
	});

	app.get('/launched/:id', [functions.requireLogin], function(req, res){
		global.session = req.params.id;
		dataAccess.reqQuestBySess(global.session, function(questions){
			res.render('../view/launched.ejs', { 
				title: 'Amphiquizz - Questionnaire en cours',
				idSession: req.params.id,
				questions: questions
			});
		});
	});

	app.get('/register', function(req, res){
		res.render('../view/register.ejs', { 
				title: 'Amphiquizz - Créer un compte',
	  			erreur: req.query.failed 
	  	});
	});

	app.use(function(req, res){
		res.render('../view/404error.ejs', { title: 'Amphiquizz - Impossible de trouver la page demandée' });
	});

}
