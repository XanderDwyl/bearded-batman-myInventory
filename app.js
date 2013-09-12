var express = require('express');
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var port = process.env.PORT || 3000;
var app = express();
var path = require('path'),
	passport = require('passport');

require('express-namespace');

// application settings
require('./config/express')(app, config, passport);

// routes
require('./config/routes')(app, passport);

// Start the app
app.listen(port);
console.log('Express app started on port '+port)

// Expose app
module.exports = app