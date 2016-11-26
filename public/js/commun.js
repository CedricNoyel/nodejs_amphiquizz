
// Connection SOCKET
var socket = io.connect('http://localhost:8080');

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

	mes_quest.html('Mes questionnaires');
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

    socket.on('message', function(message){
		notif(message, "#39CA74");
    });

    function notif(text, color) {
		$('.pop').remove();
		pop = $('<div/>')
				.addClass('pop')
				.text(text)
				.css({color: '#FFF', backgroundColor: color });
		$('body').append(pop);

		setTimeout(function (argument) {
			$(pop).fadeOut('200');
		}, 1400);
	}

});

