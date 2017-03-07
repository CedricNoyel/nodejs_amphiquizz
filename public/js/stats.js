
// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
console.log("stats.js | LOADED");

function drawChart(listeReponses, result) {
	console.log(listeReponses);
	console.log(result);


	var ctx;

	var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	var labels = new Array();
	var rowsa = new Array();
	var nbReponse = new Array();

	// REMPLISSAGE DES LETTRES SOUS LE GRAPHE
	for (var k=0; k<listeReponses.length; k++) {
		labels.push(letters[k]);
		// console.log(listeReponses[k] + " - " + result[k].NB_SMS);
		if (result[k] != null)
			rowsa.push(new Array(letters[k], result[k].NB_SMS));
		else
			rowsa.push(new Array(letters[k], 0));
	}
	// FIN REMPLISSAGE DES LETTRES SOUS LE GRAPHE

	for (var k=0; k<listeReponses.length; k++){
		nbReponse.push(rowsa[k][1]);
	}

	console.log("nbReponse: " + nbReponse)

	var data = {
	    labels: labels,
	    datasets: [
			{
	            label: "Nombre de réponses",
	            backgroundColor: "rgba(255,99,132,0.2)",
	            borderColor: "rgba(255,99,132,1)",
	            borderWidth: 2,
	            hoverBackgroundColor: "rgba(255,99,132,0.4)",
	            hoverBorderColor: "rgba(255,99,132,1)",
	            data: nbReponse
			}
		]
	};

	var options = {

	}

	// ctx = document.getElementById('pieChart');

	// var myPieChart = new Chart(ctx, {
	// 	type: 'pie',
	// 	data: data,
	// 	options: options
	// });

	ctx = document.getElementById('barChart');

	var myBarChart = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: options
	});
}
/*
function drawChart(listeReponses, result) {
	console.log(listeReponses);
	console.log(result);

	var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

	// Create the data table.
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Réponses');
	data.addColumn('number', 'Nombre');

	// REMPLISSAGE DES LETTRES SOUS LE GRAPHE
	var rowsa = new Array();
	for (var k=0; k<listeReponses.length; k++) {
		// console.log(listeReponses[k] + " - " + result[k].NB_SMS);
		if (result[k] != null)
			rowsa.push(new Array(letters[k], result[k].NB_SMS));
		else
			rowsa.push(new Array(letters[k], 0));
	}
	// FIN REMPLISSAGE DES LETTRES SOUS LE GRAPHE

	data.addRows(rowsa);

	// Set pie chart options
	var piechart_options = {
		title : 'Stats',
		width : 500,
		height : 400,
		legend : 'none',
		pieSliceText : 'label',
		tooltip: { trigger: 'selection' },
		colors:['#DCDCDC', '#C0C0C0', '#8f8f8f', '#696969', '#303030', '#000000']
	};

	// Instantiate and draw our chart, passing in some options.
	var piechart = new google.visualization.PieChart(document.getElementById('pieChart'));
	piechart.draw(data, piechart_options);


	// Set column chart options
	var columnchart_options = {
		title: 'Stats',
		width : 500,
		height : 400,
		legend: 'none',
		colors: ['#8f8f8f'],
		format: 'decimal',
		vAxis: {
        	viewWindow: { min: 0 }
        }
	};

	// Instantiate and draw our chart, passing in some options.
	var columnchart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
	columnchart.draw(data, columnchart_options);

}
*/
