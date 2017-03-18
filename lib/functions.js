// functions.js

console.log('- functions.js loaded'.yellow);

var crypto = require('crypto');
var db = require('./db');
var dataAccess = require('./dataAccess');

module.exports = {

	firstLetterToUpper: function(str){
	    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	},

	checkUserPass: function (profList, username, password, sess, callback){
		var logged = 0;
        for(var k in profList){
			if (username==profList[k].IDENTIFIANT_PROFESSEUR){
				if (crypto.createHash('md5').update(password).digest("hex")==profList[k].PASSWORD_PROFESSEUR)
				{
					logged++;
					sess.id_professeur = profList[k].ID_PROFESSEUR;
					sess.nom = profList[k].NOM_PROFESSEUR.toUpperCase();
					sess.prenom = this.firstLetterToUpper(profList[k].PRENOM_PROFESSEUR);
					sess.identifiant = profList[k].IDENTIFIANT_PROFESSEUR;
					console.log(sess.identifiant + " is connected -> creating session".grey);
				}
			}
		}
		callback(logged);
    },

	/** Middleware for security (each user can only see his questions */
	checkIdQuestion: function(req, res, next){
		var queryString = 'SELECT * FROM QUESTION q LEFT JOIN QUESTIONNAIRE qu ON qu.ID_QUESTIONNAIRE = q.ID_QUESTIONNAIRE WHERE qu.ID_PROFESSEUR=? AND q.ID_QUESTION=?' ;
		db.query(queryString, [req.session.id_professeur, req.params.id], function(err,rows){
			if(rows != null && rows.length!=0){
				next();
			} else {
				res.redirect("../rip");
			}
		});
	},

	/** Middleware for security (each user can only see his questionnary */
	checkIdQuestionnaire: function(req, res, next){
		var queryString = 'SELECT * FROM QUESTIONNAIRE WHERE ID_PROFESSEUR=? AND ID_QUESTIONNAIRE=?';
		db.query(queryString, [req.session.id_professeur, req.params.id], function(err,rows){
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
							if(password1 != null && password2 != null && password1.length <= 100 && password1 == password2) {
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
	},

	requireSMS_Add: function(numTel, smsTxt, callback) {
		smsTxt = smsTxt.toUpperCase();
		if (global.currentQuestion !== false || global.session !== false && global.appelEnCours===false) { // If a session is running
			if ( this.isSmsValidResponse(smsTxt) ) {
				this.checkExistEleve(numTel, smsTxt, function(idEleve) { // trouve l'eleve ou le cree
					dataAccess.findSmsEstLie(idEleve, function(resEstLie) {
						if (resEstLie == "")
						{
							dataAccess.findAnswersCurrentQuestion(function(resListeReponse) {
								if( smsTxt.charCodeAt(0)< 65+resListeReponse.length ) // A=65 - Z=90 
								{
									dataAccess.addSms(idEleve, numTel, smsTxt, function(idInsertSms) { // Ajout du SMS
										dataAccess.addEstLie(idInsertSms, function(res) {
											console.log(("App received a SMS from " + numTel + " : '" + smsTxt + "' added on SMS_ID: " + idInsertSms).green);
											callback(res);
										});
									});
								}
							});
							
						} else { if (global.DEBUG) console.log("Ce numéro a déjà répondu à cette question".red);}
					});
				});
			}
		} else if (global.appelEnCours){ // SI C'EST UN APPEL
			if (this.isSmsValidName(smsTxt))
			{
				this.checkExistEleve(numTel, smsTxt, function(idEleve) { // trouve l'eleve ou le cree
					dataAccess.checkPhoneNumberNotYetResponded(numTel, global.dateDebutAppel, function(res){
						if (res.length == 0){ // SI AUCUN SMS RECU PAR CE NUM DEPUIS LE DEBUT DE L'APPEL
							dataAccess.updateEleve(smsTxt, numTel, function(resUpdateEleve){
								console.log(smsTxt + " ajoute au numero de : " + numTel);
								dataAccess.addSms(idEleve, numTel, smsTxt.toUpperCase(), function(idInsertSms) { // Ajout du SMS
									console.log(("App received a SMS from " + numTel + " : '" + smsTxt + "' added on SMS_ID: " + idInsertSms).green);
								});
							});

						} else console.log((numTel + " a deja repondu a l'appel !").red);
					});
				});
			}
		} else console.log(("App received a SMS from " + numTel + " : '" + smsTxt + "' but there is no session or call running !").red);
	},

	QuestionSmsNotInDb: function(idEleve, smsTxt, numTel){
		return false;
	},

	checkExistEleve: function(numTel, smsTxt, callback){
		dataAccess.findByFieldHasValue("ELEVE", "TELEPHONE_ELEVE", numTel, function(res){
			if (res == "" || res == null ) // Si l'élève est inconnu dans la base, on le crée
			{
				dataAccess.addEleve(numTel, function(resAddEleve){
					if (global.debug) console.log("Ajout de l'eleve: " + resAddEleve.insertId + "dans la base".yellow);
					callback(resAddEleve.insertId);
				});
			} else callback(res[0].ID_ELEVE); // Si l'élève est connu
		});
	},

	isAnySessionOpen: function(callback){
		dataAccess.findByFieldHasValue("SESSION", "STATUT_ACTIF", 1, function(res){
			if (res == "") callback(false);
			else callback(res);
		});
	},

	isSmsValidResponse: function(str){
		var regex = /[a-zA-Z]/;
		if (str.length == 1 && regex.test(str)){
			return true;
		} else {
			if (global.DEBUG) console.log(("Le contenu du SMS: " + str + " est invalide !").red);
			return false;
		}
	},

	isSmsValidName: function(str){
		var regex = /^([ \u00c0-\u01ffa-zA-Z'\-])+$/
		if (str.length > 1 && str.length < 50 && regex.test(str) ){
			return true;
		} else {
			if (global.DEBUG) console.log(("Le contenu du SMS: " + str + " est invalide pour l'appel !").red);
			return false;
		}
	}


}
