// functions.js

var crypto = require('crypto');
var db = require('./db');
var dataAccess = require('./dataAccess');
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
	},

	/** Middleware check session exist */
	notLogged: function(req, res, next){
		var sess = req.session;
		if(sess.id_professeur != null){
			res.redirect('/admin');
		} else {
			next();
		}
	},

	checkRegister: function(name, firstname, login, password1, password2, callback){
		dataAccess.findAll('PROFESSEUR', function(profList){
			var alreadyExist = false;
			for(var i in profList){
				if (name == profList[i].NOM_PROFESSEUR){
					var alreadyExist = true;
					callback("L'identifiant de connexion existe déjà");
				}
			}
			if (!alreadyExist){
				if (name != null && name.length >= 1 && name.length <= 100) {
					if(firstname != null && firstname.length >= 1 && firstname.length <= 100) {
						if(login != null && login.length >= 3 && login.length <= 100) {
							if(password1 != null && password2 != null && password1.length >= 6 && password1.length <= 100 && password1 == password2) {
								password1 = crypto.createHash('md5').update(password1).digest("hex");
								dataAccess.addProff(name, firstname, login, password1, function(result){ 
									callback("0");
								});
							} else callback("Le mot de passe doit correspondre et doit contenir entre 6 et 100 caracteres");
						} else callback("L'identifiant de connexion doit contenir entre 3 et 100 caracteres");
					} else callback("Le prénom doit contenir entre 1 et 100 caracteres");
				} else callback("Le nom doit contenir entre 1 et 100 caracteres");
			}
		});
	}

}