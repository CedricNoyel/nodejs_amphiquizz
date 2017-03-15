// sockets.js

console.log('- sockets.js loaded'.yellow);

var dataAccess = require('./dataAccess');
var socketio = require('socket.io');
var express = require('express');
var session = require('express-session');
var functions = require('./functions');
var DateDebutAppel;

module.exports = function(http){
	var io = require("socket.io")(http);

	io.on('connection', function(socket) {

		//////////
		// LOOP //
		//////////

		setInterval(function() {
			if (global.session != false && global.CurrentQuestion != false){
	          	dataAccess.findSMS(global.session, global.currentQuestion, function(data){
	          		// console.log(data)
	    			socket.emit('send_stats', data);
	    		});
	    	}
        }, 5000); // Remettre à 10000

		setInterval(function() {
			if (global.appelEnCours){
				// console.log('date debut appel' + dateDebutAppel);
	    		dataAccess.findSMS_Appel(dateDebutAppel, function(data){
	    			// console.log(data);
					socket.emit('req_add_name', data);
	    		});
	    	}
        }, 2000);

		//////////////
		// END LOOP //
		//////////////

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
				socket.emit('res_add_answer', id_reponse);
			});
	    });

	     socket.on('req_save_questionnaire', function(id_questionnaire, nom_questionnaire){
			dataAccess.editQuestionnaire(id_questionnaire, nom_questionnaire, function(){
				socket.emit('message', "Le questionnaire a bien été mis à jour");
			});
	     });

	     socket.on('req_save_question', function(id_question, nom_question){
	        dataAccess.editQuestion(id_question, nom_question, function(){
	        	console.log("QUESTION:" + nom_question);
	        	socket.emit('message', "La question a bien été mise à jour");
	        });
	     });

	    socket.on('edit_answer', function(id_bonne_reponse, id_question, ID_QUESTIONNAIRE){
	        dataAccess.editGoodAnswer(id_bonne_reponse, id_question, function(){
	        	socket.emit('message', "La réponse a bien été sauvegardé");
	        });
	    });

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

	    socket.on('req_launch_questionnaire', function(id_session){
	    	dataAccess.reqCreateSession(sess.id_professeur, id_session, function(res){
				global.session = res.insertId;
	    		socket.emit('res_launch_questionnaire', res.insertId);
	    		console.log("Lancement d'un questionaire sur la session " + id_session);
	    	});
	    });

	    socket.on('req_stop_questionnaire', function(){
	    	dataAccess.reqStopSession(global.session, function(res){
	    		if (global.DEBUG) console.log('Questionnaire quitté sur la session ' + global.session);
	    		socket.emit('res_stop_questionnaire', res);
				global.session = false;
				global.currentQuestion = false;
	    	});
	    });

	    socket.on('req_addQuestionRapide', function(id_question, questionName, answer_A, answer_B, goodAnswer){
	    	dataAccess.reqIdQuestionnaire(id_question, function(idquestionnaire){
	    		dataAccess.editQuestionnaire(idquestionnaire, questionName, function(){
	    			dataAccess.del("REPONSE", "ID_QUESTION", id_question, function(){
		    			dataAccess.editQuestion(id_question, questionName, function(){
							dataAccess.addAnswer(answer_A, id_question, function(id_reponse_A){
								dataAccess.addAnswer(answer_B, id_question, function(id_reponse_B){
									if (goodAnswer==="A")
										dataAccess.editGoodAnswer(id_reponse_A, id_question, function(){
										});
									else
										dataAccess.editGoodAnswer(id_reponse_B, id_question, function(){});
								});
							});
						});
		    		});
		    	});
	    	});
	    });

	    socket.on('req_answer_by_idQuestion', function(idQuestion){
	    	global.currentQuestion = idQuestion;
	    	dataAccess.findByFieldHasValue('REPONSE', 'ID_QUESTION', idQuestion, function(result){
	    		socket.emit('res_answer_by_idQuestion', result);
	    	});
		});

		socket.on('req_del_session', function(idSession){
			dataAccess.del('SESSION', 'ID_SESSION', idSession, function(res){
				socket.emit('res_del_session', res);
				socket.emit('message', "La session a été supprimé !");
			});
		});

		socket.on('req_export_data', function(idQuestionnaire, idSession){
	    	dataAccess.findExportData(idQuestionnaire, idSession, function(res){
	    		socket.emit('res_export_data', res);
	    	});
	    });

		// ================ //
		// APPEL DES ELEVES //
		// ================ //
	    socket.on('req_start_call', function(date){
	    	global.dateDebutAppel = date;
	    	socket.emit('res_start_call', "");
	    	socket.emit('message', "Appel lancé");
	    	global.appelEnCours = true;
	    });

	    socket.on('req_stop_call', function(){
	    	global.dateDebutAppel = false;
	    	socket.emit('res_stop_call', "");
			socket.emit('message', "Appel stoppé");
	    	global.appelEnCours = false;
	    });

	});
}
