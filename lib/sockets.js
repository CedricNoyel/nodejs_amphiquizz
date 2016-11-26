// sockets.js

console.log('- sockets.js loaded');
var dataAccess = require('./dataAccess');
var socketio = require('socket.io');
var express = require('express');
var session = require('express-session');

module.exports = function(http){
	var io = require("socket.io")(http)
	
	io.on('connection', function(socket) {

	    socket.on('req_add_question', function(id_questionnaire){
	        dataAccess.addQuestion(id_questionnaire, function(id_question){
				socket.emit('res_add_question', id_question);
	        });
	    });

	    socket.on('req_fastquestion_add', function(questionnaire_name){
	        dataAccess.addQuestionnaire(sess.id_professeur, questionnaire_name, function(id_quest){
	        	dataAccess.addQuestion(id_quest, function(id_question){
	        		socket.emit('res_fastquestion_add', id_question);
	        	});
	       	});
	    });

	     socket.on('req_add_questionnaire', function(nom_questionnaire){
	        dataAccess.addQuestionnaire(sess.id_professeur, nom_questionnaire, function(id_quest){
				socket.emit('res_add_questionnaire', id_quest);
	        });
	    });

	     socket.on('req_add_answer', function(answer, id_question){
			dataAccess.addAnswer(answer, id_question, function(id_reponse){
				socket.emit('res_add_answer', id_reponse.insertId);
				socket.emit('message', "La réponse a bien été ajoutée");
			});
	    });

	    // Requete user info
	    socket.on('req_user_info', function(){
	        socket.emit('res_user_info', { nom : sess.nom, prenom : sess.prenom, identifiant : sess.identifiant });
	    });

	    // Demande questionnaire de l'utilisateur
	    socket.on('req_user_quest', function(){
	    	dataAccess.findQuestionnaireByIdProf(sess.id_professeur, function(data){
	        	socket.emit('res_user_quest', data);
	    	});
	    });

    	// Result question du questionnaire (asked in admin.html)
	    socket.on('req_question_by_questionnaire_id', function(id_questionnaire){
			dataAccess.findByFieldHasValue('QUESTION', 'ID_QUESTIONNAIRE', id_questionnaire, function(questions){
				dataAccess.findByFieldHasValue('QUESTIONNAIRE', 'ID_QUESTIONNAIRE', id_questionnaire, function(questionnaire){
	        		socket.emit('res_question_by_questionnaire_id', questions, questionnaire);
				});
			});
	    });

	    // Demande des question/réponses
	    socket.on('req_question_reponse', function(id_question){
			dataAccess.findByFieldHasValue('QUESTION', 'ID_QUESTION', id_question, function(questions){
				dataAccess.findByFieldHasValue('REPONSE', 'ID_QUESTION', id_question, function(reponses){
					socket.emit('res_question_reponse', questions, reponses);
				});
			});
	    });

	     socket.on('req_save_questionnaire', function(id_questionnaire, nom_questionnaire){
			dataAccess.editQuestionnaire(id_questionnaire, nom_questionnaire, function(){
				socket.emit('message', "Le questionnaire a bien été mis à jour");
			});
	     });

	     socket.on('req_save_question', function(id_question, nom_question){
	        dataAccess.editQuestion(id_question, nom_question, function(){
	        	socket.emit('message', "La question a bien été mise à jour");
	        });
	     });

	    socket.on('edit_answer', function(id_bonne_reponse, id_question, ID_QUESTIONNAIRE){
	        dataAccess.editGoodAnswer(id_bonne_reponse, id_question, function(){
	        	socket.emit('message', "La réponse a bien été sauvegardé");
	        });
	    });

	    // Demande suppression questionnaire
	     socket.on('req_del_questionnaire', function(id_questionnaire){
	        dataAccess.del('QUESTIONNAIRE', 'ID_QUESTIONNAIRE', id_questionnaire, function(){
	        	socket.emit('message', "Le questionnaire a bien été supprimé");
	        });
	    });
	  
	    socket.on('del_answer', function(id_answer){
	        dataAccess.del('REPONSE', 'ID_REPONSE', id_answer, function(){
	        	socket.emit('message', "La réponse a bien été supprimée");
	        });
	    });

	    socket.on('del_answer_question', function(id_question){
	        dataAccess.del('REPONSE', 'ID_QUESTION', id_question, function(){
	        });
	    });

	    socket.on('del_question', function(id_question){
	        dataAccess.del('QUESTION', 'ID_QUESTION', id_question, function(){
	        	socket.emit('message', "La question a bien été supprimée");
	        });
	    });

	    socket.on('req_stats', function(id_questionnaire){
	    	dataAccess.reqStat(id_questionnaire, function(data){
	    		socket.emit('res_stats', data);
	    	});
	    });
	
	});
}