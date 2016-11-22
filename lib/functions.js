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

	/** Middleware for security (each user can only see his questions */
	checkIdQuestion: function(req, res, next){
		var queryString = 'SELECT * FROM QUESTION q LEFT JOIN QUESTIONNAIRE qu ON qu.ID_QUESTIONNAIRE = q.ID_QUESTIONNAIRE WHERE qu.ID_PROFESSEUR=' + req.session.id_professeur +' AND q.ID_QUESTION=' + req.params.id ;
		db.query(queryString, function(err,rows){
			if(rows != null && rows.length!=0){
				next();
			} else {
				res.redirect("../rip");
			}
		});
	},

	/** Middleware for security (each user can only see his questionnary */
	checkIdQuestionnaire: function(req, res, next){
		var queryString = 'SELECT * FROM QUESTIONNAIRE WHERE ID_PROFESSEUR=' + req.session.id_professeur +' AND ID_QUESTIONNAIRE=' + req.params.id ;
		db.query(queryString, function(err,rows){
			if(rows != null && rows.length!=0){
				next();
			} else {
				res.redirect("../rip");
			}
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