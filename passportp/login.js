var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;



module.exports = function(passport) {

	passport.serializeUser(function(User, done) {
		console.log('Serializing User...');
		console.log(User._id);
		done(null, {
			id: User._id,
			username: User.username
		});
	});

	passport.deserializeUser(function(id, done) {
		console.log("id: ");
		console.log(id);
		User.findOne({'username': id.username}, function(error, User) {
			console.log('Deserializing User...');
			console.log(User);
			done(error, User);
		});
	});

	passport.use( new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password'	
		},
		function(username, password, done) {
			console.log("username: " + username + "  password: "+ password);
			process.nextTick(function() {
				User.findOne({'username': username}, function(err, onj) {
					console.log("===found this user====");
					console.log(onj);
					if(err) {
						return done(err);
					}
					if(!onj) {
						return done(null, onj);
					}
					if(onj.password != password) {
						return done(null, false);
					}
					return done(null, onj);
				});
			});
		})
	);

	passport.authMiddleware = function(req, res, next) {
	    if (req.isAuthenticated()) {
	      return next();
		}
	    res.redirect('/')
	}
}