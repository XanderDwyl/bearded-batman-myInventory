var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    passportLocalMongoose = require('../config/passport-user');

var UserSchema = new Schema({
	_id:                { type: Number, default: 0 },
    fullname:           { type: String, required: true },
    email:              { type: String, required: true, index: { unique: true } },
    password:           { type: String, required: true },
    salt:               { type: String, default: '' },
    birthdate:          { type: Date, default: Date.now }, 
    homeaddress:        { type: String, required: true },
    rights:             { type: String, required: true }
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Users', UserSchema);

