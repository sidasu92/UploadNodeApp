// Dependencies
var express = require("express");

var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require("multer");
var upload = multer({dest: "./uploads"});
var mongoose = require("mongoose");
var logger = require('morgan');
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } }; 

mongoose.connect("mongodb://localhost/cloudstorage", options);
var conn = mongoose.connection;
var gfs;
var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.on('error', console.error.bind(console, 'connection error:'));

// Defining routes
var routes = require('./app/routes/cloudstorage');
var app = express();

// logging to access.log via Morgan
app.use(logger('common', {
    stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));

// parsing the json data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

app.use(express.static(__dirname + './public'));

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

if (!module.parent) {
  app.listen(3000);
}
//module.exports = router;