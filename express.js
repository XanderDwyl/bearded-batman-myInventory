
/*!
 * Module dependencies.
 */

var express       = require('express'),
    flash         = require('connect-flash');
var helpers       = require('view-helpers');
var pkg           = require('../package');
var env           = process.env.NODE_ENV || 'development';
var mongoose      = require('mongoose'),
    util          = require('util'),
    LocalStrategy = require('passport-local').Strategy

/*!
 * Expose
 */
module.exports = function (app, config, passport) {

  app.set('showStackError', true);
  app.use(express.logger('dev'));
  
  // views config
  app.set('views', config.root + '/views');
  app.set('view engine', 'ejs');

  app.configure(function() {
    app.use(express.static(config.root + '/public'))
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: pkg.name }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    // expose pkg and node env to views
    app.use(function (req, res, next) {
      res.locals.pkg = pkg;
      res.locals.env = env;
      next();
    })

    // View helpers
    app.use(helpers(pkg.name));
    app.use(app.router);

    // custom error handler
    app.use(function (err, req, res, next) {
      if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next()
      }

      console.error(err.stack)
      res.status(500).render('500');
    })

    app.use(function (req, res, next) {
      res.status(404).render('404', { url: req.originalUrl})
    })

    //app.use(express.static(config.root + '/public'));
  });
  
  var user = require('../models/user');
  // Configure passport
  passport.use(new LocalStrategy(user.authenticate()));

  passport.serializeUser(user.serializeUser());
  passport.deserializeUser(user.deserializeUser());

  // Connect mongoose
  mongoose.connect(config.db, function(err) {
    //console.log("error:",config.db, err)
    if (err) console.log("error:",config.db, env);
    console.log('Successfully connected to : ', config.db);
});
}
