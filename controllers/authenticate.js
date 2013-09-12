
/*!
 * Module dependencies.
 */
var user     = require('../models/user')

exports.isAdminAuthenticated = function (req, res, next) {
  console.log('Rights:%s,isAuthenticated:%s',req.user.rights,req.isAuthenticated());
  if(!req.isAuthenticated()) {    
    return res.redirect('/login')
  } else {
    if(req.user.rights!=='Admin')
      return res.redirect('/404')
  }
  next()
}
exports.isAuthenticated = function (req, res, next) {
  if(!req.isAuthenticated()) {    
    return res.redirect('/login')
  } 
  next()
}



