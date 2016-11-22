// dataAccess.js

var colors = require('colors');
var mysql= require('mysql');
var db = require('./db');
console.log('- dataAccess.js loaded');

module.exports = {

	findAll: function(table, callback){
		var list = new Array();
		var queryString = 'SELECT * FROM ' + table;
		db.query(queryString, function(err,rows){
			if(err) throw err;
			for(var i=0; i<rows.length; i++)
			{
				list.push(rows[i]);
			}
			console.log(queryString.green);
			callback(list);
		});
	},

	findByFieldHasValue: function(table, fieldname, value, callback){
		var list = new Array();
		var queryString = 'SELECT * FROM ' + table + ' WHERE ' + fieldname + '=' + value;
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			for(var i=0; i<rows.length; i++)
			{
				list.push(rows[i]);
			}
			callback(list);
		});
	},

	findQuestionnaireByIdProf: function(idprof, callback){
		var list = new Array();
		var queryString = "SELECT DISTINCT(q.ID_QUESTIONNAIRE), NOM_QUESTIONNAIRE, count(ID_QUESTION) as 'nb_questions', ETAT_QUESTIONNAIRE FROM QUESTIONNAIRE q LEFT JOIN QUESTION qu ON qu.ID_QUESTIONNAIRE=q.ID_QUESTIONNAIRE WHERE ID_PROFESSEUR=? GROUP BY q.ID_QUESTIONNAIRE, NOM_QUESTIONNAIRE, ETAT_QUESTIONNAIRE";
		db.query(queryString, [idprof], function(err,rows){
			if(err) throw err;
			for(var i=0; i<rows.length; i++)
			{	list.push(rows[i]);		}
			console.log(queryString.yellow);
			callback(list);
		});
	},

	addQuestion: function(id_questionnaire, callback){
		var queryString = "INSERT INTO `QUESTION`(`ID_QUESTIONNAIRE`, `NOM_QUESTION`, `REPONSE_QUESTION`) VALUES (?, '', '0');";
		console.log(queryString.yellow);
		db.query(queryString, [id_questionnaire], function(err,rows){
			if(err) throw err;
			callback(rows.insertId);
		});
	},

	addQuestionnaire: function(id_professeur, nom_questionnaire, callback){
		var queryString = "INSERT INTO `QUESTIONNAIRE`(`ID_PROFESSEUR`, `NOM_QUESTIONNAIRE`, `ETAT_QUESTIONNAIRE`) VALUES (?, ?, 'Invalide');";
		console.log(queryString.yellow);
		db.query(queryString, [id_professeur, nom_questionnaire], function(err,rows){
			if(err) throw err;
			callback(rows.insertId);
		});
	},

	editQuestionnaire: function(id_questionnaire, nom_questionnaire, callback){
		var queryString = "UPDATE QUESTIONNAIRE SET NOM_QUESTIONNAIRE=? WHERE ID_QUESTIONNAIRE=?"
		console.log(queryString.yellow);
		db.query(queryString, [nom_questionnaire, id_questionnaire], function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	editQuestion: function(id_question, nom_question, callback){
		var queryString = "UPDATE QUESTION SET NOM_QUESTION=? WHERE ID_QUESTION=?";
		console.log(queryString.yellow);
		db.query(queryString, [nom_question, id_question], function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	del: function(table, field, value, callback){
		var queryString = "DELETE FROM " + table + " WHERE " + field + "=" + value;
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	addAnswer: function(answer, id_question, callback){
		var queryString = "INSERT INTO `REPONSE` (`ID_QUESTION`, `NOM_REPONSE`) VALUES(?,?)";
		console.log(queryString.yellow);
		db.query(queryString, [id_question, answer], function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	editGoodAnswer: function(answer_name, ID_QUESTION, callback){
		var queryString = "UPDATE QUESTION SET REPONSE_QUESTION=? WHERE ID_QUESTION=?";
		console.log(queryString.yellow);
		db.query(queryString, [answer_name, ID_QUESTION], function(err,rows){
			if(err) throw err;
			callback();
		});
	},


}