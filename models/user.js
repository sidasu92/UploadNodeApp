var mongoose = require('mongoose');

var user = mongoose.Schema({
	username: String,
	password: String,
	email: String,
	gender: String,
	address: String,
	fileNames: String
}, {collection: 'userInfo'});

module.exports = mongoose.model('User', user);