
// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart(listeReponses, result) {
	//console.log(listeReponses);
	//console.log(result);

	// Create the data table.
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Réponses');
	data.addColumn('number', 'Nombre');

	var rowsa = new Array();
	for (var k=0; k<listeReponses.length; k++) {
		// console.log(listeReponses[k] + " - " + result[k].NB_SMS);
		if (result[k] != null)
			rowsa.push(new Array(listeReponses[k], result[k].NB_SMS));
		else
			rowsa.push(new Array(listeReponses[k], 0));
	}

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
