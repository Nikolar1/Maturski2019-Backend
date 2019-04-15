var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const Sequelize = require('sequelize');
var korisnik = require('./model/korisnik');
var odeljenje = require('./model/Odeljenje');
var proizvod = require('./model/Proizvod');
var radi = require('./model/Radi');
var radnik = require('./model/radnik');
var ugradjeno = require('./model/Ugradjen')
var jwt = require('jsonwebtoken');
var config = require('./config');
var middleware = require('./middleware');
const port = 3000;
var app = express();
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
  host: "localhost",
  user: "root",
  password: "password",
  database: "fabrika",
  insecureAuth : true
});

app.post('/Authentification', function(req, res){
  var lista;
  con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    var sql = "SELECT * FROM korisnik";
    con.query(sql, (err, result, fields) => {
      if (err) throw err;
  	   lista= result;
      lista.forEach(function (item) {
        if(item.EMAIL == req.body.EMAIL && item.PASS==req.body.PASS){
            var token = jwt.sign({EMAIL: req.body.EMAIL},
              config.tajna,
              { expiresIn: '24h' // expires in 24 hours
              }
            );
            res.json({
            success: true,
            message: 'Authentication successful!',
            token: token
            });
      }

    });
  });
});

app.post('/hranilica',function(req, res){

});


app.get('/',middleware.checkToken,function(req, res){
  var stanica;
  var hranilica;
  var korisnik;
//  con.connect((err) => {
//    if (err) throw err;
    console.log("Connected!");
    var sql = "SELECT * FROM korisnik";
    con.query(sql, (err, result, fields) => {
      if (err) throw err;
  	   korisnik= result;
       sql = "SELECT * FROM stanica";
       con.query(sql, (err, result, fields) => {
         if (err) throw err;
         stanica= result;
          sql = "SELECT * FROM hranilica";
          con.query(sql, (err, result, fields) => {
            if (err) throw err;
             hranilica= result;
             res.json({
             korisnik: korisnik,
             stanica: stanica,
             hranilica: hranilica,
             });
          });
       });
    });
//  });
});

app.listen(port, (err) => {
  if (err) console.log(err.message);
  console.log("App running on port 3000 of localhost");
});
