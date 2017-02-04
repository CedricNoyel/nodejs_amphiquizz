// dataAccess.js

var colors = require('colors');
var mysql= require('mysql');
var db = require('./db');
console.log('- dataAccess.js loaded');

module.exports = {

	///////////////
	// GENERIQUE //
	///////////////

	findAll: function(table, callback){
		var list = new Array();
		var queryString = 'SELECT * FROM ' + table;
		db.query(queryString, function(err,rows){
			if(err) throw err;
			for(var i in rows)
			{
				list.push(rows[i]);
			}
			callback(list);
		});
	},

	del: function(table, field, value, callback){
		var queryString = "DELETE FROM " + table + " WHERE " + field + "=?";
		db.query(queryString, [value], function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	findByFieldHasValue: function(table, fieldname, value, callback){
		var list = new Array();
		var queryString = 'SELECT * FROM ' + table + ' WHERE ' + fieldname + '=?';
		db.query(queryString, [value], function(err,rows){
			if(err) throw err;
			for(var i in rows)
			{
				list.push(rows[i]);
			}
			callback(list);
		});
	},

	////////////////
	// PROFESSEUR //
	////////////////

	findQuestionnaireByIdProf: function(idprof, callback){
		var list = new Array();
		var queryString = "SELECT DISTINCT(q.ID_QUESTIONNAIRE), NOM_QUESTIONNAIRE, count(ID_QUESTION) as 'nb_questions', ETAT_QUESTIONNAIRE FROM QUESTIONNAIRE q LEFT JOIN QUESTION qu ON qu.ID_QUESTIONNAIRE=q.ID_QUESTIONNAIRE WHERE ID_PROFESSEUR=? GROUP BY q.ID_QUESTIONNAIRE, NOM_QUESTIONNAIRE, ETAT_QUESTIONNAIRE ORDER BY q.ID_QUESTIONNAIRE DESC";
		db.query(queryString, [idprof], function(err,rows){
			if(err) throw err;
			for(var i in rows)
			{	list.push(rows[i]);		}
			callback(list);
		});
	},

	addProff: function(name, firstname, login, password, callback){
		var queryString = "INSERT INTO PROFESSEUR(NOM_PROFESSEUR, PRENOM_PROFESSEUR, IDENTIFIANT_PROFESSEUR, PASSWORD_PROFESSEUR) VALUES(?,?,?,?)";
		console.log(queryString);
		db.query(queryString, [name, firstname, login, password], function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	//////////////
	// QUESTION //
	//////////////

	addQuestion: function(id_questionnaire, callback){
		var queryString = "INSERT INTO `QUESTION`(`ID_QUESTIONNAIRE`, `NOM_QUESTION`) VALUES (?, '');";
		console.log(queryString);
		db.query(queryString, [id_questionnaire], function(err,rows){
			if(err) throw err;
			callback(rows.insertId);
		});
	},

	editQuestion: function(id_question, nom_question, callback){
		var queryString = "UPDATE QUESTION SET NOM_QUESTION=? WHERE ID_QUESTION=?";
		console.log(queryString);
		db.query(queryString, [nom_question, id_question], function(err,rows){
			if(err) throw err;
			callback();
		});
	},
	///////////////////
	// QUESTIONNAIRE //
	///////////////////

	reqIdQuestionnaire: function(idQuestion, callback){
		var queryString = "SELECT ID_QUESTIONNAIRE FROM QUESTION WHERE ID_QUESTION=?";
		console.log(queryString);
		db.query(queryString, [idQuestion], function(err,rows){
			if(err) throw err;
			callback(rows[0].ID_QUESTIONNAIRE);
		});
	},

	addQuestionnaire: function(id_professeur, nom_questionnaire, callback){
		var queryString = "INSERT INTO `QUESTIONNAIRE`(`ID_PROFESSEUR`, `NOM_QUESTIONNAIRE`, `ETAT_QUESTIONNAIRE`) VALUES (?, ?, 'Invalide');";
		console.log("INSERT INTO `QUESTIONNAIRE`(`ID_PROFESSEUR`, `NOM_QUESTIONNAIRE`, `ETAT_QUESTIONNAIRE`) VALUES ("+id_professeur+", "+nom_questionnaire+", 'Invalide')");
		db.query(queryString, [id_professeur, nom_questionnaire], function(err,rows){
			if(err) throw err;
			callback(rows.insertId);
		});
	},

	editQuestionnaire: function(id_questionnaire, nom_questionnaire, callback){
		var queryString = "UPDATE QUESTIONNAIRE SET NOM_QUESTIONNAIRE=? WHERE ID_QUESTIONNAIRE=?";
		console.log(queryString);
		db.query(queryString, [nom_questionnaire, id_questionnaire], function(err,rows){
			if(err) throw err;
			callback();
		});
	},

	/////////////
	// REPONSE //
	/////////////

	addAnswer: function(answer, id_question, callback){
		var queryString = "INSERT INTO `REPONSE` (`ID_QUESTION`, `NOM_REPONSE`) VALUES(?,?)";
		db.query(queryString, [id_question, answer], function(err,rows){
			if(err) throw err;
			else callback(rows.insertId);
		});
	},

	editGoodAnswer: function(id_good_answer, ID_QUESTION, callback){
		var queryString = "UPDATE QUESTION SET ID_REPONSE_BONNE=?, ETAT_QUESTION=1 WHERE ID_QUESTION=?";
		console.log(queryString);
		db.query(queryString, [id_good_answer, ID_QUESTION], function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	/////////////
	// SESSION //
	/////////////

	reqCreateSession: function(id_prof, id_questionnaire, callback){
		var queryString = "INSERT INTO SESSION(`ID_SESSION`, `ID_PROFESSEUR`, `ID_QUESTIONNAIRE`, `STATUT_ACTIF`, `DATE_SESSION`) VALUES (NULL, ?, ?, '1', CURRENT_TIMESTAMP);";
		console.log(queryString);
		db.query(queryString, [id_prof, id_questionnaire], function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	reqStopSession: function(id_session, callback){
		var queryString = "UPDATE SESSION SET STATUT_ACTIF=0 WHERE ID_SESSION=?;";
		console.log(queryString);
		db.query(queryString, [id_session], function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	reqQuestBySess: function(id_session, callback){
		var queryString = "SELECT DISTINCT qu.ID_QUESTION, qu.NOM_QUESTION, qu.ID_REPONSE_BONNE"
							+ " FROM SESSION s JOIN QUESTION qu ON qu.ID_QUESTIONNAIRE=s.ID_QUESTIONNAIRE WHERE ID_SESSION=?;";
		console.log(queryString);
		db.query(queryString, [id_session], function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	//////////////////
	// STATISTIQUES //
	//////////////////

	reqStat: function(id_questionnaire, callback){
		var queryString = "SELECT * FROM QUESTION Q JOIN REPONSE R ON R.ID_QUESTION=Q.ID_QUESTION WHERE ID_QUESTIONNAIRE=?";
		console.log(queryString);
		db.query(queryString, [id_questionnaire], function(err,rows){
			if(err) throw err;
			callback(rows);
		});
	},

	reqExportInfo: function(id_questionnaire, callback){
		var queryString = 'SELECT distinct NOM_QUESTION, VALEUR_SMS FROM QUESTIONNAIRE q '
							+ 'join QUESTION qu ON qu.ID_QUESTIONNAIRE=q.ID_QUESTIONNAIRE '
							+ 'join SESSION s ON s.ID_QUESTIONNAIRE=q.ID_QUESTIONNAIRE '
							+ 'join EST_LIE el ON el.ID_SESSION=s.ID_SESSION '
							+ 'join SMS_RECU sms ON sms.ID_SMS=el.ID_SMS '
							+ 'WHERE q.ID_QUESTIONNAIRE=?';
		console.log(queryString);
		db.query(queryString, [id_questionnaire], function(err,rows){
			if(err) throw err;
			console.log(rows);
			callback(rows);
		});
	},

	findSMS: function(idSession, idQuestionnaire, callback){
		var queryString = 'SELECT VALEUR_SMS, count(*) as "NB_SMS" FROM EST_LIE E JOIN SMS_RECU S on S.ID_SMS=E.ID_SMS where ID_SESSION=? AND ID_QUESTION=? group by VALEUR_SMS';
		console.log(queryString);
		db.query(queryString, [idSession, idQuestionnaire], function(err,rows){
			if(err) throw err;
			callback(rows);
		});

	},

	findExportData: function(idQuestionnaire, idSession, callback){
		var queryString = 'SELECT SM.TELEPHONE_SMS as "Numtel", QU.NOM_QUESTION as "Question", SM.VALEUR_SMS as "Reponse" from SMS_RECU SM join EST_LIE E on E.ID_SMS = SM.ID_SMS join QUESTION QU on QU.ID_QUESTION=E.ID_QUESTION where QU.ID_QUESTIONNAIRE=? and E.ID_SESSION=?';
		console.log(queryString);
		db.query(queryString, [idQuestionnaire, idSession], function(err,rows){
			if(err) throw err;
			callback(rows);
		});

	},

	addEleve: function(numTel, callback){
		var queryString = "INSERT INTO ELEVE (`TELEPHONE_ELEVE`) VALUES (?);";
		db.query(queryString, [numTel], function(err, res){
			if(err) throw err;
			callback(res);
		});
	},

	addSms: function(idEleve, phoneNum, smsTxt, callback){
		var queryString = "INSERT INTO SMS_RECU(`ID_ELEVE`, `TELEPHONE_SMS`, `VALEUR_SMS`) VALUES (?,?,?);";
		db.query(queryString, [idEleve, phoneNum, smsTxt], function(err,res){
			if(err) throw err;
			callback(res);
		});
			
	}

}