
/*!
 * Module dependencies.
 */     
var util = require('util'),
    crypto = require('crypto'),
    LocalStrategy = require('passport-local').Strategy,
    BadRequestError = require('passport-local').BadRequestError;

// Expose
module.exports = function(schema, options) {
	options 			= options || {};
    options.saltlen 	= options.saltlen || 32;
    options.iterations 	= options.iterations || 100;
    options.keylen 		= options.keylen || 100;
    
    // Populate field names with defaults if not set
    options.fullnameField	= options.fullnameField  || 'fullname';
    options.birthdateField 	= options.birthdateField || 'birthdate';
    options.contactNoField	= options.contactNoField || 'contactNo';
    options.AddressField	= options.AddressField 	 || 'homeaddress';
    options.emailField		= options.emailField	 || 'email';
    options.passwordField 	= options.passwordField  || 'password';
    options.saltField 		= options.saltField 	 || 'salt';

    options.notmatchpasswordError 	= options.notmatchpasswordError  || 'password_notmatch';
    options.incorrectEmailError 	= options.incorrectEmailError 	 || 'incorrect_email';
    options.missingFullnameError 	= options.missingFullnameError 	 || 'missing_fullname';
    options.missingAddressError 	= options.missingAddressError 	 || 'missing_address';
    options.emailExistsError 		= options.emailExistsError 		 || 'email_exist';

    var schemaFields = {};
    if (!schema.path(options.fullnameField)) schemaFields[options.fullnameField] = String;
    if (!schema.path(options.birthdateField)) schemaFields[options.birthdateField] = Date;
    if (!schema.path(options.contactNoField)) schemaFields[options.contactNoField] = String;
    if (!schema.path(options.AddressField)) schemaFields[options.AddressField] = String;
    if (!schema.path(options.emailField)) schemaFields[options.emailField] = String;
    
    schemaFields[options.passwordField] = String;
    schemaFields[options.saltField] = String;
    
    schema.add(schemaFields);

    schema.methods.setPassword = function (password, cb) {
        if (!password) {
            return cb(new BadRequestError(options.notmatchpasswordError));
        }
        
        var self = this;

        crypto.randomBytes(options.saltlen, function(err, buf) {
            if (err) {  return cb(err);  }

            var salt = buf.toString('hex');
            crypto.pbkdf2(password, salt, options.iterations, options.keylen, function(err, hashRaw) {
                if (err) {   return cb(err);    }

                self.set(options.passwordField, new Buffer(hashRaw, 'binary').toString('hex'));
                self.set(options.saltField, salt);

                cb(null, self);
            });
        });
    };
    schema.methods.authenticate = function(password, cb) {
        var self = this;
        crypto.pbkdf2(password, this.get(options.saltField), options.iterations, options.keylen, function(err, hashRaw) {
            if (err)  return cb(err);
            
            var hash = new Buffer(hashRaw, 'binary').toString('hex');

            if (hash === self.get(options.passwordField)) {
                return cb(null, self);
            } else {
                return cb(null, false, { message: options.notmatchpasswordError});
            }
        });
    };
    schema.statics.authenticate = function() {
        var self = this;

        return function(email, password, cb) {
            self.findByEmail(email, function(err, user) {
                if (err) { return cb(err); }

                if (user) {
                    return user.authenticate(password, cb);
                } else {
                    return cb(null, false, { message: options.incorrectEmailError })
                }
            });
        }
    };
    schema.statics.serializeUser = function() {
        return function(email, cb) {
            cb(null, email.get(options.emailField));
        }
    };
    schema.statics.deserializeUser = function() {
        var self = this;

        return function(email, cb) {
            self.findByEmail(email, cb);
        }
    };
    schema.statics.register = function(user, password, cb) {
        // Create an instance of this in case user isn't already an instance
        if (!(user instanceof this)) {
            user = new this(user);
        }
        
        if (!user.get(options.fullnameField)) {
        	return cb(new BadRequestError(util.format(options.missingFullnameError)));
        }
        if (!user.get(options.emailField)) {
            return cb(new BadRequestError(util.format(options.incorrectEmailError, options.emailField)));
        }        
		if (!user.get(options.passwordField) || !password) {
            return cb(new BadRequestError(util.format(options.notmatchpasswordError)));
        } else {
        	if (user.get(options.passwordField) !== password)
        		return cb(new BadRequestError(util.format(options.notmatchpasswordError)));
        }
        if (!user.get(options.AddressField) ) {
            return cb(new BadRequestError(util.format(options.notmatchpasswordError)));
        }

        var self = this;
        self.findByEmail(user.get(options.emailField), function(err, existingUser) {
            if (err) { return cb(err); }
            
            if (existingUser) {
                return cb(new BadRequestError(util.format(options.emailExistsError, user.get(options.emailField))));
            }
            
            user.setPassword(password, function(err, user) {
                if (err) { return cb(err); }

                user.save(function(err) {
                    if (err) { return cb(err);  }

                    cb(null, user);
                });
            });
        });
    };

    schema.statics.findByEmail = function(email, cb) {
        var queryParameters = {};
        queryParameters[options.emailField] = email;
        
        var query = this.findOne(queryParameters);
        if (options.selectFields) {
            query.select(options.selectFields);
        }

        query.exec(cb);
    };
    schema.statics.createStrategy = function() {
        return new LocalStrategy(options, this.authenticate());
    };
}



