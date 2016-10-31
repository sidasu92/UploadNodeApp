// Dependencies
var express = require("express");

var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require("multer");
var upload = multer({dest: "./uploads"});
var mongoose = require("mongoose");

var logger = require('morgan');
var passport  = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var LocalStrategy = require('passport-local').Strategy;

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } }; 

mongoose.connect("mongodb://heroku_96kdsxqg:qo1r4rau44l39ejp8fqibg06f@ds053196.mlab.com:53196/heroku_96kdsxqg", options);
//mongoose.connect("mongodb://localhost/cloudstorage", options);
var conn = mongoose.connection;
var gfs;
var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;


conn.on('error', console.error.bind(console, 'connection error:'));

// Defining routes
var routes = require('./routes/cloudstorage')(passport);
var app = express();

// logging to access.log via Morgan
app.use(logger('common', {
    stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));

// Middleware Configuration // Stackoverflow: http://stackoverflow.com/questions/16781294/passport-js-passport-initialize-middleware-not-in-use
// app.configure(function() {
  app.use(express.static(__dirname + './public'));
  app.use(cookieParser());
  // parsing the json data
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded( {extended: true} ));
  app.use(bodyParser.text());
  app.use(bodyParser.json({ type: 'application/json' }));
  app.use(session({secret: 'keyboard cats'}));
  app.use(passport.initialize());
  app.use(passport.session());

// });

var initializePassport = require('./passportp/login');
initializePassport(passport);
// Sending instance of mongoose.connection to routes
app.use((req, res, next) => {
  req.conn = conn;
  next();
});

// All methods written in routes folder js
app.use('/', routes);

//view engine setup
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err,
  });
});

// for heroku error
if (!module.parent) {
  app.listen(process.env.PORT || 3032, '0.0.0.0');
  console.log('Listening for connections...');
}
//module.exports = router;