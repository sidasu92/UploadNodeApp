// https://github.com/John-Lin/express-file-upload/blob/master/routes/index.js
// Dependencies
var express = require('express');
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
// //for all files 1
// var Schema = mongoose.Schema;

var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var upload = multer({ dest: './uploads/'});
var router = express.Router();
var User = require('../models/user');
var gfs;

var gridSchema = new mongoose.Schema({}, {strict: false });
var gridAll = mongoose.model("gridAll", gridSchema, "fs.files");

var passport  = require('passport');
// var login = require('./login');


// route middleware to make sure
function amILoggedIn(req, res, next) {
	console.log("this is the req:: ");
	console.log(req);
	//check if I am authenticated
	if (req.isAuthenticated())
		return next();
	//send me back to login page mapped here
	res.redirect('/');
}
/*
	this code is for finding all the files of fs.files
	//TODO: Sid to reduce the complexity
*/

// Returning the router
module.exports = function(passport) {
	//TODO: sid to make code backward compatible with previous node versions
	// router.get('/', (req, res) => {
	//   res.render('login');
	// });

	router.get('/', function(req, res) {
		res.render('login'); // load the index.ejs file
	});

	// POST
	// To upload a file
	router.post("/", upload.single("myFile"), function(req, res, next) {
		var conn = req.conn;
	  	gfs = Grid(conn.db);
		//create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
		var writestream = gfs.createWriteStream( {filename: req.file.originalname} );
		
		//pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
		fs.createReadStream("./uploads/" + req.file.filename)
			.on("end", function() {
		  		fs.unlink("./uploads/"+ req.file.filename, function(err) {
		  			var username = req.user.username;
					//Sharing code
				    //TODO: reuse the code written in REST endpoint
				    User.findOne({'username': username}, function(err, object) {	
						if(err) {
							return done(err);
						}
						if(!object) {
							return done(null, object);
						}
						object.fileNames = object.fileNames + "," + req.file.originalname;
						console.log("===found this user====");
						console.log(object);
						object.save(function(error){
							if(error) {
								res.send("Error!");
							}else {
								res.send("<h1>Success! Your file is uploaded.</h1> <br/> <a href=" +"\"\\uploaded\\"+ req.file.originalname + "\">"+ "Take me to the File!"   );
							}
						});
					});
		  		})
		  	})
		    .on("err", function() {
		    	res.send("Error uploading file");
		    })
		     .pipe(writestream);
	});

	// GET
	// To download the file we saved
	router.get("/files/:filename", amILoggedIn, function(req, res) {
	 	var conn = req.conn;
	  	gfs = Grid(conn.db);
	  	//res.set("Content-Disposition","attachment; filename=" + fileName);
	  	var readstream = gfs.createReadStream({filename: req.params.filename});
	  	readstream.on("error", function(err) {
	  		res.send("Unable to find any file with this name. Please check the name again.");
	  	});
	  	readstream.pipe(res);
	});

	// GET
	// to get descriptive page for the uploaded file
	router.get('/uploaded/:id', amILoggedIn, function(req, res) {
		var fileId = req.params.id;
	  	console.log('param id:: '+req.params.id);

	  	var conn = req.conn;
	  	gfs = Grid(conn.db);
	 	console.log("this is the fileId: " + fileId);
	  	gfs.findOne({filename: fileId}, function (err, file) {
		    if (err) {
		    	res.status(500);
		    }
		    console.log("this is the file:: ");
		    console.log(file);
		    res.render('displayFile', {file: file});
	  	});
	});

	// GET
	// to delete the file with name passed as parameter
	router.get("/delete/:filename", amILoggedIn, function(req, res){
		gfs.exist({filename: req.params.filename}, function(err, exists) {
			if(err) 
		  		return res.send("Some eroor has occured!!");
		  	if(exists) {
		    	gfs.remove({filename: req.params.filename}, function(err){
		      		if(err) return res.send("Error occured");
		      		res.send("File deleted!");
		    	});
		  	} else {
		    	res.send("Unable to find any file with this name. Please check the name again.");
		  	}
		});
	});

	// GET
	// To Share with the user name
	router.get("/share/:filename",amILoggedIn, function(req, res){
		var username = req.query.userName;
		console.log("filename is: ");
		console.log(req.params.filename);
		console.log("username is: ");
		console.log(req.query.userName);
		User.findOne({'username': username}, function(err, object) {	
			if(err) {
				return done(err);
			}
			if(!object) {
				return done(null, object);
			}
			object.fileNames = object.fileNames + "," + req.params.filename;
			console.log("===found this user====");
			console.log(object);
			object.save(function(error){
				if(error) {
					res.send("Error!");
				}else {
					res.send("File Shared!");
				}
			});
		});
	});

	// GET
	// To show all files of logged in user
	router.get("/allFiles", amILoggedIn, function(req, res){
		//for all files 2,3 
	 	console.log("req.session.passport.user:: ");
	 	console.log(req.user);
	 	//console.log(req.session.passport.user);
	 	var username = req.user.username;
	 	console.log("username: ");
	 	console.log(username);
	 	// var arrayOfFileId;
		User.findOne({'username': username}, function(err, object) {	
			if(err) {
				res.status(500);
			}
			if(!object) {
				res.status(500);
			}
			var files = object.fileNames;
			// console.log("===found this user====");
			// console.log(object);
			// console.log("===found these realted files====");
			// console.log(files);
			var myArray = files.split(",");

		  	var newArray = new Array();
		  	for (var i = 0; i < myArray.length; i++) {
	    	  if (myArray[i] != 'undefined') {
		      	newArray.push(myArray[i]);
		      }
		  	}
			console.log("===the array is====");
			console.log(newArray);
			gridAll.find( { filename: { $in: newArray } }, function(err, outputfiles){
				if(err) res.status(500);
				console.log("these are all the files.fs entries:  ");
				console.log( outputfiles );
				return res.render('allFiles', {outputfiles: outputfiles, username: username});
			});
		});
	});

	// To show Login Page
	router.get("/login", function(req, res) {
		res.render('login');	
	});

	router.post("/login", 
		passport.authenticate('local', {
			successRedirect: '/index',
			failureRedirect: '/error'
		})
	);

	router.get('/index', amILoggedIn, function(req, res, next){
		res.render('index');
	});

	router.get('/error', function(req, res, next){
		res.send('Unable to authenticate');
	});

	//GET
	//To logout of sessions
	router.get('/logout', function (req, res){
	  req.session.destroy(function (err) {
	    res.redirect('/'); //Inside a callback… bulletproof!
	  });
	});

	return router;
}