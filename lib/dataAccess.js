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
		var queryString = "SELECT DISTINCT(q.ID_QUESTIONNAIRE), NOM_QUESTIONNAIRE, count(ID_QUESTION) as 'nb_questions', ETAT_QUESTIONNAIRE FROM QUESTIONNAIRE q LEFT JOIN QUESTION qu ON qu.ID_QUESTIONNAIRE=q.ID_QUESTIONNAIRE WHERE ID_PROFESSEUR=" + idprof + " GROUP BY q.ID_QUESTIONNAIRE, NOM_QUESTIONNAIRE, ETAT_QUESTIONNAIRE";
		db.query(queryString, function(err,rows){
			if(err) throw err;
			for(var i=0; i<rows.length; i++)
			{	list.push(rows[i]);		}
			console.log(queryString.yellow);
			callback(list);
		});
	},

	addQuestion: function(id_questionnaire, callback){
		var queryString = "INSERT INTO `QUESTION`(`ID_QUESTIONNAIRE`, `NOM_QUESTION`, `REPONSE_QUESTION`) VALUES (" + id_questionnaire + ", '', '0');";
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback(rows.insertId);
		});
	},

	addQuestionnaire: function(id_professeur, nom_questionnaire, callback){
		var queryString = "INSERT INTO `QUESTIONNAIRE`(`ID_PROFESSEUR`, `NOM_QUESTIONNAIRE`, `ETAT_QUESTIONNAIRE`) VALUES (" + id_professeur + ", '" + nom_questionnaire + "', 'Invalide');";
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback(rows.insertId);
		});
	},

	editQuestionnaire: function(id_questionnaire, nom_questionnaire, callback){
		var queryString = "UPDATE QUESTIONNAIRE SET NOM_QUESTIONNAIRE='"+ nom_questionnaire +"' WHERE ID_QUESTIONNAIRE="+ id_questionnaire;
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	editQuestion: function(id_question, nom_question, callback){
		var queryString = "UPDATE QUESTION SET NOM_QUESTION='"+ nom_question +"' WHERE ID_QUESTION="+ id_question;
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	del: function(table, field, value, callback){
		var queryString = "DELETE FROM "+ table +" WHERE "+ field +"=" + value;
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	addAnswer: function(answer, id_question, callback){
		var queryString = "INSERT INTO `REPONSE` (`ID_QUESTION`, `NOM_REPONSE`) VALUES("+ id_question +", '"+ answer +"')";
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	editGoodAnswer: function(answer_name, ID_QUESTION, ID_QUESTIONNAIRE, callback){
		var queryString = "UPDATE QUESTION SET REPONSE_QUESTION='"+ answer_name +"' WHERE ID_QUESTION="+ ID_QUESTION;
		console.log(queryString.yellow);
		db.query(queryString, function(err,rows){
			if(err) throw err;
			callback();
		});
	},


}