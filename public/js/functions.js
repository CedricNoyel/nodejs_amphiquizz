
function notif(text, color) {
	$('.pop').remove();

	pop = $('<div/>')
			.addClass('pop')
			.text(text)
			.css({
				color: '#FFF',
				backgroundColor: color
			});

	$('body').append(pop);

	setTimeout(function (argument) {
		$(pop).fadeOut('200');
	}, 1400);
}

function info(text, button="yesCancel", callback) {

	w = $(window).width();
	h = $(window).height();

	$('.info').remove();

	bloc = $('<div/>')
			.addClass('info')
			.css('display', 'none');

	boxAlert = $('<div/>')
			.addClass('boxAlert')
			.css({
				color: '#000',
				backgroundColor: '#FFF'
			});

	textAlert = $('<p/>')
			.addClass('textAlert')
			.text(text);

	$(boxAlert).append(textAlert);

	switch (button) {
		case 'yesCancel':
			buttonCancel = $('<button/>')
					.addClass('bouton suppr')
					.text('Annuler')
					.click(function(event) {
						$('.info').fadeOut('fast');
						callback(false);
					});

			buttonYes = $('<button/>')
					.addClass('bouton save')
					.text('Oui')
					.click(function(event) {
						$('.info').fadeOut('fast');
						notif("Question supprimée !", "#E54D42");
						callback(true);
					});

			$(boxAlert).append(buttonCancel);
			$(boxAlert).append(buttonYes);
			break;
		case 'yesNo':
			buttonNo = $('<button/>')
					.addClass('bouton suppr')
					.text('Non')
					.click(function(event) {
						$('.info').fadeOut('fast');
						callback("no");
					});

			buttonYes = $('<button/>')
					.addClass('bouton save')
					.text('Oui')
					.click(function(event) {
						$('.info').fadeOut('fast');
						callback("yes");
					});

			buttonCancel = $('<button/>')
					.addClass('bouton')
					.text('Retour')
					.click(function(event) {
						$('.info').fadeOut('fast');
						callback("cancel");
					});

			$(boxAlert).append(buttonNo);
			$(boxAlert).append(buttonCancel);
			$(boxAlert).append(buttonYes);
			break;
		default:
			break;
	}

	$(bloc).append(boxAlert);
	$('body').append(bloc);
	$('.info').fadeIn('fast');
}


function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
	var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
	var CSV = '';   
	CSV += ReportTitle + '\r\n\n';
	if (ShowLabel) {
	    var row = "";
	    for (var index in arrData[0]) 
	    {
	        row += index + ';';
	    }
	    row = row.slice(0, -1);
	    CSV += row + '\r\n';
	}    
	for (var i = 0; i < arrData.length; i++) {        
		var row = "";               
		for (var index in arrData[i]) {
		    row += '"' + arrData[i][index] + '";';        
		}        row.slice(0, row.length - 1);
	    CSV += row + '\r\n';    
	}
	if (CSV == '') {                
		alert("Invalid data");        
		return;    
	}       
	var fileName = "MyReport_";    
	fileName += ReportTitle.replace(/ /g,"_");       
	var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);    
	var link = document.createElement("a");        
	link.href = uri;    
	link.style = "visibility:hidden";    
	link.download = fileName + ".csv";    
	document.body.appendChild(link);    
	link.click();    
	document.body.removeChild(link);
}
	