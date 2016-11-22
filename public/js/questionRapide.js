
$(document).ready(function(){

	$('#lancer').click(function(){
		alert("questionnaire lancé")
	});

	$('#btnSupprimerQuestion').click(function(){
		alert("question supprimée")
	});

	$('#oui_non').click(function(){
		$("#rep_A").val("Oui");$("#rep_B").val("Non")
	});

});