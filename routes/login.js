var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		console.log('Serializing User...');
		console.log(User);
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(error, User) {
			console.log('Deserializing User...');
			console.log(User);
			done(error, user);
		});
	});

	passport.use( new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password'	
		},
		function(username, password, done) {
			process.nextTick(function() {
				User.findOne({'username': username}, function(err, User) {
					if(err) {
						return done(err);
					}
					if(!User) {
						return done(null, User);
					}
					if(User.password != password) {
						return done(null, false);
					}
					return done(null, User);
				});
			});
		})
	);
}