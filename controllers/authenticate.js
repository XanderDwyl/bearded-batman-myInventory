
/*!
 * Module dependencies.
 */
var user     = require('../models/user')

exports.isAdminAuthenticated = function (req, res, next) {
  if(!req.isAuthenticated()) {    
    return res.redirect('/login')
  } else {
    if(req.user.rights!=='Admin')
      return res.redirect('/404')
  }
  next()
}




