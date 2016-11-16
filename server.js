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
var profList = findAll('PROFESSEUR');
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
    data[0] = findByFieldHasValue('QUESTION', 'id_questionnaire', ID_QUESTIONNAIRE);
    data[1] = findByFieldHasValue('QUESTIONNAIRE', 'id_questionnaire', ID_QUESTIONNAIRE);
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(fs.readFileSync('./view/questionnaire.html').toString());
});

app.get('/admin/question/:id', [requireLogin], function(req, res){
    sess=req.session;
    var id_question = req.params.id;

    data[0] = findByFieldHasValue('QUESTION', 'ID_QUESTION', id_question);
    data[1] = findByFieldHasValue('REPONSE', 'ID_QUESTION', id_question);

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
        if (username==profList[k].IDENTIFIANT_PROFESSEUR){
            if (password==profList[k].PASSWORD_PROFESSEUR){
                logged++;
                sess=req.session;
                sess.id_professeur = profList[k].ID_PROFESSEUR;
                sess.nom = profList[k].NOM_PROFESSEUR;
                sess.prenom = profList[k].PRENOM_PROFESSEUR;
                sess.identifiant = profList[k].IDENTIFIANT_PROFESSEUR;
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

    /* ================ */
    /* ==== CREATE ==== */
    /* ================ */

    socket.on('req_add_question', function(id_questionnaire){
        addQuestion(id_questionnaire, function(id_question){
          socket.emit('res_add_question', id_question);
        });
    });

     socket.on('req_add_questionnaire', function(nom_questionnaire){
        addQuestionnaire(sess.id_professeur, nom_questionnaire, function(id_quest){
          socket.emit('res_add_questionnaire', id_quest);
        });
    });

     socket.on('add_answer', function(answer, id_question){
        addAnswer(answer, id_question);
    });

    /* ============== */
    /* ==== READ ==== */
    /* ============== */

    // Requete user info
    socket.on('req_user_info', function(){
        socket.emit('res_user_info', { nom : sess.nom, prenom : sess.prenom, identifiant : sess.identifiant });
    });

    // Demande questionnaire de l'utilisateur
    socket.on('req_user_quest', function(){
        socket.emit('res_user_quest', data[0]);
    });

    // Demande des question
    socket.on('req_question_by_questionnaire_id', function(id_questionnaire){
        socket.emit('res_question_by_questionnaire_id', data[0], data[1], ID_QUESTIONNAIRE); // data[0] -> Questions / data[1] -> quesionnaire
    });

    // Demande des question/réponses
    socket.on('req_question_reponse', function(){
        socket.emit('res_question_reponse', data[0], data[1]);
    });

    /* ================ */
    /* ==== UPDATE ==== */
    /* ================ */

     socket.on('req_save_questionnaire', function(id_questionnaire, nom_questionnaire){
        editQuestionnaire(id_questionnaire, nom_questionnaire);
     });

     socket.on('req_save_question', function(id_question, nom_question){
        editQuestion(id_question, nom_question);
     });

    socket.on('edit_answer', function(answer_name, ID_QUESTION){
        editGoodAnswer(answer_name, ID_QUESTION);
    });

    /* ================ */
    /* ==== DELETE ==== */
    /* ================ */

    // Demande suppression questionnaire
     socket.on('req_del_questionnaire', function(id_questionnaire){
        delQuestionnaire(id_questionnaire);
        socket.emit('res_del_questionnaire');
    });
  
    socket.on('del_answer', function(id_answer){
        del('REPONSE', 'ID_REPONSE', id_answer);
    });
    socket.on('del_question', function(id_question){
        del('QUESTION', 'ID_QUESTION', id_question);
    });

});


// ===== SERVER ====== 
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
      var queryString = "SELECT DISTINCT(q.ID_QUESTIONNAIRE), NOM_QUESTIONNAIRE, count(ID_QUESTION) as 'nb_questions', ETAT_QUESTIONNAIRE FROM QUESTIONNAIRE q LEFT JOIN QUESTION qu ON qu.ID_QUESTIONNAIRE=q.ID_QUESTIONNAIRE WHERE ID_PROFESSEUR=" + idprof + " GROUP BY qu.ID_QUESTIONNAIRE, NOM_QUESTIONNAIRE, ETAT_QUESTIONNAIRE";
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
      var queryString = 'SELECT * FROM QUESTION q LEFT JOIN QUESTIONNAIRE qu ON qu.ID_QUESTIONNAIRE = q.ID_QUESTIONNAIRE WHERE qu.ID_PROFESSEUR=' + idprof;
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
      var queryString = 'SELECT * FROM QUESTION q LEFT JOIN QUESTIONNAIRE qu ON qu.ID_QUESTIONNAIRE = q.ID_QUESTIONNAIRE WHERE qu.ID_QUESTIONNAIRE=' + idQuestionnaire;
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

  function addQuestion(id_questionnaire, callback){
      var queryString = "INSERT INTO `QUESTION`(`ID_QUESTIONNAIRE`, `NOM_QUESTION`, `REPONSE_QUESTION`) VALUES (" + id_questionnaire + ", '', '0');";
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
        callback(rows.insertId);
      });
  };

  function addQuestionnaire(id_professeur, nom_questionnaire, callback){
      var queryString = "INSERT INTO `QUESTIONNAIRE`(`ID_PROFESSEUR`, `NOM_QUESTIONNAIRE`, `ETAT_QUESTIONNAIRE`) VALUES (" + id_professeur + ", '" + nom_questionnaire + "', 'Invalide');";
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
        callback(rows.insertId);
      });
  };

  function editQuestionnaire(id_questionnaire, nom_questionnaire){
      var queryString = "UPDATE QUESTIONNAIRE SET NOM_QUESTIONNAIRE='"+ nom_questionnaire +"' WHERE ID_QUESTIONNAIRE="+ id_questionnaire;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
  }

  function editQuestion(id_question, nom_question){
      var queryString = "UPDATE QUESTION SET NOM_QUESTION='"+ nom_question +"' WHERE ID_QUESTION="+ id_question;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
  }

  function delQuestionnaire(idQuestionnaire){
      var queryString = "DELETE FROM `QUESTIONNAIRE` WHERE ID_QUESTIONNAIRE=" + idQuestionnaire;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
  }

  function del(table, field, value){
      var queryString = "DELETE FROM "+ table +" WHERE "+ field +"=" + value;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
  }

  function addAnswer(answer, id_question){
      var queryString = "INSERT INTO `REPONSE` (`ID_QUESTION`, `NOM_REPONSE`) VALUES("+ id_question +", '"+ answer +"')";
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
  }

  function editGoodAnswer(answer_name, ID_QUESTION){
      var queryString = "UPDATE QUESTION SET REPONSE_QUESTION='"+ answer_name +"' WHERE ID_QUESTION="+ ID_QUESTION;
      console.log(queryString.yellow);
      db.query(queryString, function(err,rows){
        if(err) throw err;
      });
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