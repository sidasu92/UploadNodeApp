// https://github.com/John-Lin/express-file-upload/blob/master/routes/index.js
// Dependencies
var express = require('express');
var multer  = require('multer');
var fs = require('fs');
var path = require('path');

var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var upload = multer({ dest: './uploads/'});
var router = express.Router();
var gfs;

router.get('/', (req, res) => {
  res.render('index');
});

//
router.post("/", upload.single("myFile"), function(req, res, next) {
	var conn = req.conn;
  	gfs = Grid(conn.db);
	//create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
	console.log('original name: '+req.file.originalname);
	var writestream = gfs.createWriteStream( {filename: req.file.originalname} );
	
	// //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
	fs.createReadStream("./uploads/" + req.file.filename)
		.on("end", function() {
	  		fs.unlink("./uploads/"+ req.file.filename, function(err) {
	  			res.send("<h1>Success! Your file is uploaded.</h1> <br/> <a href=" +"\"\\uploaded\\"+ req.file.originalname + "\">"+ "Take me to the File!"   );
	  			// gfs.findOne({filename: req.file.originalname}, (err, file) => {
				  //   if (err) {
				  //     res.status(500);
				  //   }
				  //   console.log("this is the file which was uploaded right now :: ");
				  //   console.log(file);
				  //   res.render('displayFile', {file: file});
			  	// });
	  		})
	  	})
	    .on("err", function() {
	    	res.send("Error uploading file");
	    })
	     .pipe(writestream);
});

// To download the file we saved
router.get("/files/:filename", function(req, res) {
 	var conn = req.conn;
  	gfs = Grid(conn.db);
  	//res.set("Content-Disposition","attachment; filename=" + fileName);
  	var readstream = gfs.createReadStream({filename: req.params.filename});
  	readstream.on("error", function(err) {
  		res.send("Unable to find any file with this name. Please check the name again.");
  	});
  	readstream.pipe(res);
});

// to get descriptive page for the uploaded file
router.get('/uploaded/:id', function(req, res) {
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

// to delete the file with name passed as parameter
router.get("/delete/:filename", function(req, res){
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

// Returning the router
module.exports = router;