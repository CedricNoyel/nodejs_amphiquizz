
Le développement suit un modèle MVC

# Require
Git du projet: https://github.com/cedricouf/nodejs_amphiquizz
python
nodejs
gsmmodem
pm2 (module node)
mysql server
mysql client
npm : sudo apt-get install npm

# Config GSMMODEM:
On execute la commande a chaque lancement de l'application dans le code : 

	usb_modeswitch -b2 -W -v 12d1 -p 1446 -n --message-content 555342437f0000000002000080000a11062000000000000100000000000000
Permet d'enlever le dongle du "Storage mode". "1446" correspond à l'ID du module SMS, celui-ci doit ensuite changer pour devenir généralement 14ac ou 1506 pour que le dongle marche correctement.

Dans /etc/usb_modeswitch.conf:

	DisableSwitching=0
	DisableMBIMGlobal=0
	EnableLogging=1

	# HUAWEI E353 (DNA)
	DefaultVendor=0x12d1
	DefaultProduct=0x1446
	TargetVendor=0x12d1
	TargetProduct=0x1446
	MessageContent="55534243123456780000000000000a11062000000000000100000000000000"

# Launch app
simple: 
	
	node app.js
Sur server raspberry: 
	
	pm2 start app.js  (Moteur de )


# Config db
Configuration de votre base dans ./lib/db.js

# fonctions complexes
Les grosses fonctions effectuant des actions assez "lourdes" sont gérées dans le fichier ./lib/functions.js

# Requetes BDD:
Toutes les requêtes à la base sont effectuées dans le fichier ./lib/dataAccess.js

# Routes
Les routes sont configurées dans ./lib/router.js

# Sockets: Communication vue / server
Tous les événements relatifs aux sockets sont gérés dans le fichier ./lib/socket.js

# Les vues
Les vues sont dans ./view et sont gérées avec le moteur de template EJS. le dossier ./view/partials correspond aux includes effectuées dan les autres fichiers de vues

admin.ejs -> Page après s'être connécté (affichage de la liste des questionnares)
appel.ejs -> Page pour faire l'appel
questionnaire.ejs -> Listes des questions du questionnaire
questions.ejs -> Listes des réponses pour chaque question
launched.ejs -> Page affiché au clic sur "Lancer le questionnaire" (Affichage du "diapo")
register.ejs -> Création de compte

# Réception des sms
Configuration et reception dans ./lib/sms.py puis transfert à sms.js

# Variables globales
FAKE_SMS = false; 		  -> true si vous voulez simuler une reception de SMS
SMS_MODULE =  true; 	  	  -> true: quand on test avec module(redemarrage auto si le module n'est pas trouvé) - - - false: quant on test sans module
DISPLAY_SMS = true;       	  -> afficher les sms dans la console
PORT = 8080; 			  -> port d'écoute de l'application
DEBUG = false; 			  -> affichage d'éléments dans la console

// Ne pas modifier les variables suivantes
session = false;          -> prend l'id du questionnaire en cours (lorsqu'il y en a un)
currentQuestion = false;  -> prend l'id question lorsque le questionnaire est lancé
appelEnCours = false;	  -> passe a true lorsqu'un apel est lancé
