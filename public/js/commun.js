$(document).ready(function() {

	// INIT HEADER
	var div_header = $('<div>');
	var div_compte = $('<div>');
	var p_welcome = $("<p>");
	var mes_quest = $("<p>");
	var img_logo = '<img src="../../img/logoAQLite.png" alt="Logo" class="logo">';

	div_compte.addClass('compte');
	mes_quest.addClass('titre');
	p_welcome.addClass('msgBienvenue');

	mes_quest.html('Mes questionnaire');
	div_compte.html('<button type="button" id="logout" class="deconnexion" >Deconnexion</button>');

	$('body').prepend(div_header);
	$(div_compte).append(p_welcome);
	$(div_header).append(img_logo);
	$(div_header).append(div_compte);
	$(div_header).append(mes_quest);
	// FIN INIT HEADER

	// Click sur loggout
	$('#logout').click(function(){
		document.location.href = '/logout';
	});

	// Demande et affichage informations utilisateur
	socket.emit('req_user_info');
	socket.on('res_user_info', function(user){
		$('.msgBienvenue').append('Bienvenue M/Mme ' + user.nom.toUpperCase());
	});

});

