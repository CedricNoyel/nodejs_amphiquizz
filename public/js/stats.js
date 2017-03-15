console.log("stats.js | LOADED");

function updateChart(listeReponses, result) {
	var ctx;

	var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	var labels = new Array();
	var nbReponse = new Array();

	console.log(result);

	// result = [VAL_SMS = 'b', NB_SMS = 10]

	// REMPLISSAGE DES LETTRES SOUS LE GRAPHE
	for (var i=0; i<listeReponses.length; i++) {
		labels.push(letters[i]); // [A, B, C]
	}

	for (var k=0; k<result.length; k++) {
		var indexValSMS = labels.indexOf(result[k].VALEUR_SMS.toUpperCase());

		if (indexValSMS != -1) {
			nbReponse[indexValSMS] = result[k].NB_SMS;

			console.log(nbReponse);
		}
	}

	return nbReponse;
}
