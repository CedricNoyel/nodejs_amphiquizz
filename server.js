// app.js
var colors = require('colors');
var express = require('express');
var session = require('express-session');
var app = express();  
var http = require('http').Server(app); 
var bodyParser = require('body-parser');
var io = require('socket.io')(http);
var fs = require('fs');

var db = require('./db.js');
var config = require('./config.js')

  app.use(bodyParser.json()); // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  app.use(express.static(__dirname + "/public"));
  app.use(session({
    secret: 'u9fdsS4d.#Zd8a/4J*',
    resave: false,
    saveUninitialized: true,
  }));


db = db.set();
config.set();

var questList;
var data = new Array();
var profList = findAll('professeur');
var id_questionnaire;

// ========================================
// ================ ROUTES ================
// ========================================
var sess;
app.get('/', function(req, res){
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(fs.readFileSync('./view/index.html').toString());
    // console.log("chemin: " + __dirname + '\public');
});

app.get('/admin', [requireLogin], function(req, res){
    sess=req.session;
    data[0] = findQuestionnaireByIdProf(sess.id_professeur);
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(fs.readFileSync('./view/admin.html').toString());
});

app.get('/admin/questionnaire/:id', [requireLogin], function(req, res){
    ID_QUESTIONNAIRE = req.params.id;
    sess=req.session;
    data[0] = findByFieldHasValue('question', 'id_questionnaire', ID_QUESTIONNAIRE);
    data[1] = findByFieldHasValue('questionnaire', 'id_questionnaire', ID_QUESTIONNAIRE);
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(fs.readFileSync('./view/questionnaire.html').toString());
});

app.get('/admin/question/:id', [requireLogin], function(req, res){
    sess=req.session;
    var id_question = req.params.id;

    data[0] = findByFieldHasValue('question', 'id_question', id_question);
    data[1] = findByFieldHasValue('reponse', 'id_question', id_question);

    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(fs.readFileSync('./view/question.html').toString());
});

app.get('/logout',function(req,res){
    sess=req.session;
    console.log(sess.identifiant + " logged out !".grey)
    req.session.destroy(function() {
        res.redirect('/');
    });
});

app.post('/login', function(req, res){
    var username = req.body.login;
    var password = req.body.mdp;
    var logged = 0;
    for(var k in profList){
        if (username==profList[k].identifiant_professeur){
            if (password==profList[k].password_professeur){
                logged++;
                sess=req.session;
                sess.id_professeur = profList[k].id_professeur;
                sess.nom = profList[k].nom_professeur;
                sess.prenom = profList[k].prenom_professeur;
                sess.identifiant = profList[k].identifiant_professeur;
                console.log(sess.identifiant + " is connected -> creating session".grey);
                res.redirect('/admin');
            }
        }
    }
    if (logged==0)
        res.redirect('/');
});

app.use(function(req, res){
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(fs.readFileSync('./view/404error.html').toString());
});



io.on('connection', function(socket) {    
    // Requete user info
    socket.on('req_user_info', function(){
        socket.emit('res_user_info', { 
            nom : sess.nom,
            prenom : sess.prenom,
            identifiant : sess.identifiant,
        });
    });

    // Demande questionnaire de l'utilisateur
    socket.on('req_user_quest', function(){
        socket.emit('res_user_quest', data[0]);
    });

    // Demande des question
    socket.on('req_question_by_questionnaire_id', function(id_questionnaire){
        socket.emit('res_question_by_questionnaire_id', data[0], data[1], ID_QUESTIONNAIRE); // data[0] -> Questions / data[1] -> quesionnaire
    });

    // Demande ajout questionnaire
     socket.on('req_add_questionnaire', function(nom_questionnaire){
        var x = addQuestionnaire(sess.id_professeur, nom_questionnaire);
    });

     socket.on('req_save_questionnaire', function(id_questionnaire, nom_questionnaire){
        console.log(id_questionnaire + " " + nom_questionnaire);
        editQuestionnaire(id_questionnaire, nom_questionnaire);
     });

    // Demande suppression questionnaire
     socket.on('req_del_questionnaire', function(id_questionnaire){
        delQuestionnaire(id_questionnaire);
        socket.emit('res_del_questionnaire');
    });

    socket.on('req_add_question', function(question, id_quest){
        if(addQuestionToQuestionnaire(id_quest, question)){
            var message = 'La question a bien été ajoutée au questionnaire !';
        }
        else{
            var message = 'Erreur, La question n\'a pas pu être ajoutée !'
        }
        socket.emit('res_add_question', message);
    });

    socket.on('req_question_reponse', function(){
        socket.emit('res_question_reponse', data[0], data[1]);
    });
    socket.on('add_answer', function(answer, id_question){
        addAnswer(answer, id_question);
    });
    socket.on('del_answer', function(id_answer){
        del('reponse', 'id_reponse', id_answer);
    });
    socket.on('edit_answer', function(answer_name, ID_QUESTION){
        editGoodAnswer(answer_name, ID_QUESTION);
    });
    socket.on('del_question', function(id_question){
        del('question', 'id_question', id_question);
    });
});



http.listen(8080,function(){
    console.log('\n' + "=== App Started on PORT 8080 ===".green + '\n');
});



  function findAll(table){
      var list = new Array();
      var queryString = 'SELECT * FROM ' + table;
      console.log(queryString.yellow);

      db.query(queryString, function(err,rows){
        if(err) throw err;

        for(var i=0; i<rows.length; i++)
        {
          list.push(rows[i]);
          console.log(rows[i]);
        }
        var logString =   '\n' + "=================================================================" +
                          '\n' + "     Chargement de la table " + table + " effectué avec succès" +
                          '\n' + "=================================================================";
        console.log(logString.green);
      });
      return list;
  };


  function findQuestionnaireByIdProf(idprof){
      var list = new Array();
      var queryString = "SELECT DISTINCT(q.id_questionnaire), nom_questionnaire, count(id_question) as 'nb_questions', etat_questionnaire FROM questionnaire q LEFT JOIN question qu ON qu.id_questionnaire=q.id_questionnaire WHERE id_professeur=" + idprof + " GROUP BY qu.id_questionnaire, nom_questionnaire, etat_questionnaire";
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;

        for(var i=0; i<rows.length; i++)
        {
          list.push(rows[i]);
          console.log(rows[i]);
        }
      });
      return list;
  };


  function findByFieldHasValue(table, fieldname, value){
      var list = new Array();
      var queryString = 'SELECT * FROM ' + table + ' WHERE ' + fieldname + '=' + value;
      console.log(queryString.yellow);

      db.query(queryString, function(err,rows){
        if(err) throw err;

        for(var i=0; i<rows.length; i++)
        {
          list.push(rows[i]);
          console.log(rows[i]);
        }
      });
      return list;
  };


  function findQuestionByIdProf(idprof){
      var list = new Array();
      var queryString = 'SELECT * FROM question q LEFT JOIN questionnaire qu ON qu.id_questionnaire = q.id_questionnaire WHERE qu.id_professeur=' + idprof;
      console.log(queryString.yellow);

      db.query(queryString, function(err,rows){
        if(err) throw err;

        for(var i=0; i<rows.length; i++)
        {
          list.push(rows[i]);
          console.log(rows[i]);
        }
      });
      return list;
  };

  function findQuestionByIdQuestionaire(idQuestionnaire){
      var list = new Array();
      var queryString = 'SELECT * FROM question q LEFT JOIN questionnaire qu ON qu.id_questionnaire = q.id_questionnaire WHERE qu.id_questionnaire=' + idQuestionnaire;
      console.log(queryString.yellow);

      db.query(queryString, function(err,rows){
        if(err) throw err;

        for(var i=0; i<rows.length; i++)
        {
          list.push(rows[i]);
          console.log(rows[i]);
        }
      });
      return list;
  };

  function addQuestionToQuestionnaire(id_questionnaire, question){
      var queryString = "INSERT INTO `question`(`id_questionnaire`, `nom_question`, `reponse_question`) VALUES (" + id_questionnaire + ",'" + question + "', '0')";
      console.log(queryString.yellow);

      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
      return true;
  };

  function addQuestionnaire(id_professeur, nom_questionnaire){
      var queryString = "INSERT INTO `questionnaire`(`id_professeur`, `nom_questionnaire`, `etat_questionnaire`) VALUES (" + id_professeur + ", '" + nom_questionnaire + "', 'Invalide');";
      console.log(queryString.yellow);

      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
      return true;
  };

  function editQuestionnaire(id_questionnaire, nom_questionnaire){
      var queryString = "UPDATE questionnaire SET nom_questionnaire='"+ nom_questionnaire +"' WHERE id_questionnaire="+ id_questionnaire;
      console.log(queryString.yellow);

      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
      return true;
  }

  function delQuestionnaire(idQuestionnaire){
      var queryString = "DELETE FROM `questionnaire` WHERE id_questionnaire=" + idQuestionnaire;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
      return true;
  }

  function del(table, field, value){
      var queryString = "DELETE FROM "+ table +" WHERE "+ field +"=" + value;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
      return true;
  }

  function addAnswer(answer, id_question){
      var queryString = "INSERT INTO `reponse` (`id_question`, `nom_reponse`) VALUES("+ id_question +", '"+ answer +"')";
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
      return true;
  }

  function editGoodAnswer(answer_name, ID_QUESTION){
      var queryString = "UPDATE question SET reponse_question='"+ answer_name +"' WHERE id_question="+ ID_QUESTION;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
      return true;

  }

/** Middleware for limited access and admin interface */
function requireLogin (req, res, next) {
  sess=req.session;
  if (sess.id_professeur) {
    // User is authenticated, let him in
    next();
  } else {
    res.redirect("/");
  }
}