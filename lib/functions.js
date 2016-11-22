// functions.js

var crypto = require('crypto');
var db = require('./db');
console.log('- functions.js loaded');

module.exports = {

	checkUserPass: function (profList, username, password, sess, callback){   
		var logged = 0;
        for(var k in profList){
			if (username==profList[k].IDENTIFIANT_PROFESSEUR){
				if (crypto.createHash('md5').update(password).digest("hex")==profList[k].PASSWORD_PROFESSEUR)
				{
					logged++;
					sess.id_professeur = profList[k].ID_PROFESSEUR;
					sess.nom = profList[k].NOM_PROFESSEUR;
					sess.prenom = profList[k].PRENOM_PROFESSEUR;
					sess.identifiant = profList[k].IDENTIFIANT_PROFESSEUR;
					console.log(sess.identifiant + " is connected -> creating session".grey);
				}
			}
		}
		callback(logged);
    },

	checkIdQuestion: function(sess, id_question, callback){
		var ok = true;
		var queryString = 'SELECT * FROM QUESTION q LEFT JOIN QUESTIONNAIRE qu ON qu.ID_QUESTIONNAIRE = q.ID_QUESTIONNAIRE WHERE qu.ID_PROFESSEUR=' + sess.id_professeur +' AND q.ID_QUESTION=' + id_question ;
		db.query(queryString, function(err,rows){
			if(err) throw err;
			if(rows.length!=0) ok = true;
			callback(ok);
		});
	},

	checkIdQuestionnaire: function(sess, id_questionnaire, callback){
		var ok = false;
		var queryString = 'SELECT * FROM QUESTIONNAIRE WHERE ID_PROFESSEUR=' + sess.id_professeur +' AND ID_QUESTIONNAIRE=' + id_questionnaire ;
		db.query(queryString, function(err,rows){
			if(err) throw err;
			if(rows.length!=0) ok = true;
			callback(ok);
		});
	},

	/** Middleware for limited access and admin interface */
	requireLogin: function(req, res, next) {
		sess=req.session;
		if (sess.id_professeur) {
			next();
		} else {
			res.redirect("/");
		}
	}
}