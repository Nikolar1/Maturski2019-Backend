var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const Sequelize = require('sequelize');
const cors = require("cors");
var jwt = require('jsonwebtoken');
var config = require('./config');
var middleware = require('./middleware');
const port = 3000;
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

var con = mysql.createConnection({
  host: "sql7.freesqldatabase.com",
  user: "sql7292879",
  password: "vwxig8NPy4",
  database: "sql7292879",
  insecureAuth : true
});
con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

app.post('/hranilica', function(req, res){
  var datetime = new Date();

  var sql = "SELECT * FROM hranilica";
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
     hranilica= result;
     var id = 0;
     hranilica.forEach(function (item) {
       if(item.id > id){
         id = item.id;
       }
     })
     id = id+1;
     var sql = "INSERT INTO hranilica VALUES("+ id + ",\'"+ datetime +"\', "+ req.body.HRANILICA +", "+ req.body.DOPUNJAVA +");"
     con.query(sql, (err, result, fields) => {
       if (err) {
         res.json({
           success: false,
           message: err
         });
       }else{
       res.json({
         success: true,
         message: 'Podaci uspesno dodati'
       });
     }
     });
  });
});


app.post('/stanica', function(req, res){
  var datetime = new Date();

  var sql = "SELECT * FROM stanica";
  con.query(sql, (err, result, fields) => {
    if (err) throw err;
     stanica= result;
     var id = 0;
     stanica.forEach(function (item) {
       if(item.id > id){
         id = item.id;
       }
     })
     id = id+1;
     var sql = "INSERT INTO stanica VALUES("+ id + ",\'"+ datetime +"\', "+ req.body.VLAZNOST +", "+ req.body.PRITISAK +", "+ req.body.TEMPERATURA +", "+ req.body.PADAVINE +");"
     con.query(sql, (err, result, fields) => {
       if (err) {
         res.json({
           success: false,
           message: err
         });
       }else{
       res.json({
         success: true,
         message: 'Podaci uspesno dodati'
       });
     }
     });
  });
});




app.get('/',middleware.checkToken, function(req, res){
  var hranilica;
  var korisnik;
  var stanica;
//  con.connect((err) => {
//    if (err) throw err;
    console.log("Connected!");
    var sql = "SELECT * FROM hranilica";
    con.query(sql, (err, result, fields) => {
      if (err) throw err;
  	   hranilica= result;
       sql = "SELECT * FROM korisnik";
       con.query(sql, (err, result, fields) => {
         if (err) throw err;
         korisnik= result;
          sql = "SELECT * FROM stanica";
          con.query(sql, (err, result, fields) => {
            if (err) throw err;
             stanica= result;
             res.json({
             hranilica: hranilica,
             korisnik: korisnik,
             stanica: stanica,
             });
          });
       });
    });
});

app.post('/Authentification',cors(), function(req, res){

  var lista;
  console.log(req.body);
  var provera = true;
    var sql = "SELECT * FROM korisnik";

    con.query(sql, (err, result, fields) => {
      if (err) throw err;
  	   lista= result;
      lista.forEach(function (item) {
        if(item.EMAIL == req.body.EMAIL && item.PASS==req.body.PASS){
          console.log("Authentification JE USPEO");
            var token = jwt.sign({EMAIL: req.body.EMAIL},
              config.tajna,
              { expiresIn: '24h' // expires in 24 hours
              }
            );
            res.json({
            success: true,
            token: token
            });
            provera = false;

        }
      })
      if(provera){
      res.json({
        success: false,
        message: 'Incorrect username or password'
      });
    }
    });
});

var interval = setInterval(function() {
  var sql = "SELECT 1";

  con.query(sql, (err, result, fields) => {
    if (err) throw err;
  });
}, 1000);

app.listen(process.env.PORT || port, (err) => {
  if (err) console.log(err.message);
  console.log("App running on port " + port + " of localhost");
});
