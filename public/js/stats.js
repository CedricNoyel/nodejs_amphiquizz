console.log("stats.js | LOADED");

function nbLabels(listeReponses) {

	var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	var labels = new Array();

	// REMPLISSAGE DES LETTRES SOUS LE GRAPHE
	for (var i=0; i<listeReponses.length; i++) {
		labels.push(letters[i]); // [A, B, C]
	}

	return labels;
}

function updateChart(listeReponses, result) {
	var ctx;
	var nbReponse = new Array();
	var labels = nbLabels(listeReponses);

	for (var k=0; k<result.length; k++) {
		var indexValSMS = labels.indexOf(result[k].VALEUR_SMS.toUpperCase());

		if (indexValSMS != -1) {
			nbReponse[indexValSMS] = result[k].NB_SMS;

			console.log(nbReponse);
		}
	}

	return nbReponse;
}
