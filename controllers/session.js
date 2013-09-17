
/*!
 * Module dependencies.
 */
var passport = require('passport'),
    user     = require('../models/user'),
    Medicine = require('../models/medicine');
var mongoose = require('mongoose');
var med      = mongoose.model('Medicines');
var regUser  = mongoose.model('Users');
var moment   = require('moment');
var async    = require('async');


exports.home = function (req, res) {	
  res.render('index', { user: req.user });
}

exports.login = function (req, res) {
  if(req.isAuthenticated()) { return res.redirect('/') }
  res.render('login', { user : req.user, message: ''});
}

exports.handlelogin = function (req, res, next) {	
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }

    if (!user) { 
      return res.render('login', { user: '', message: "Invalid username or password."});
    }
    req.logIn(user, function(err) {

      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
}

exports.accounts = function (req, res){
  res.render('account', { user: req.user });
}

exports.register = function (req, res) {
  res.render('register', { user: req.user, message: ''});
}
exports.registerNew = function (req, res) {
  var users = new user();
  users.fullname    = req.body.fullname; 
  users.password    = req.body.regconpass;
  users.homeaddress = req.body.homeaddress; 
  users.email       = req.body.email; 
  users.rights      = 'user';                         
  users.birthdate   = new Date();

  async.waterfall(
    [
      function(callback) {
        regUser.find().sort('-_id').exec(function(err, results){
          var currentID = 0;
          if (results[0] !== undefined) {   currentID = results[0]._id }          
          callback(null, currentID)       
        }) 
      },         
      function(currentID, callback) {
        users._id = currentID + 1
        user.register(users, req.body.regpassword, function(err, user) {
          if (err) {       
            return res.render('register', { user : user , message: err.message});
          }        
          req.logIn(user, function(err) {
            if (err) { res.redirect('/login'); }
            return res.redirect('/');
          });    
        });
      }
  ]);  

}
exports.itemDisplay = function (req, res){ 
  med.find().exec(function(err, results){
    if(err) res.render('404', { user: req.user });
    res.render('addItem', { user: req.user, medicine: results, moment: moment});
  }) 
}
exports.addItem = function (req, res){
  // create a medicine  
  var medicine = new Medicine();
  medicine.itemName         = req.body['itemName'];
  medicine.category         = req.body['selCategory'];
  medicine.classification   = req.body['classification'];
  medicine.dosage_weight    = req.body['dos_weight'];
  medicine.add_notes        = req.body['medInfo'];
  medicine.update           = '';
  medicine.userID           = req.user._id;
  medicine.units            = req.body['selUnits'];
  medicine.status           = 1;

  async.waterfall(
    [
      function(callback) {
        med.find().sort('-_id').exec(function(err, results){
          var currentID = 0;
          if (results[0] !== undefined)  {   currentID = results[0]._id     }          
          callback(null, currentID)       
        }) 
      },         
      function(currentID, callback) {
        console.log(currentID);
        medicine._id = currentID + 1
        medicine.save(function(err) {
            if (err) throw err; 
            callback(null,'Adding New medical information');              
        });
      }
  ], function(err, status) {
    med.find({},function(err, results){
      if(err) res.render('404', { user: req.user });
      res.redirect('/addItem');
    }) 
  });  
}
exports.inventoryDisplay = function (req, res){  
  async.waterfall(
    [
      function(callback) {
        med.find().exec(function(err, results){
          var populateSelectValue = {}
          if(err) res.redirect('404');
          if(err || results[0] === undefined) {
            populateSelectValue._id = ''
            populateSelectValue.itemName = ''
          } else {
            populateSelectValue = results
          }
          callback(null, populateSelectValue)
        })
      },         
      function(populateSelectValue, callback) {
        med.aggregate({'$unwind':'$inventory'},
          {'$group':{'_id':'$itemName','stockReceived':{$sum:'$inventory.qtyIn'}, 'stockUsed':{$sum:'$inventory.qtyOut'}, 'unit':{$push:'$units'}}},
          {'$sort':{'stockReceived':-1}},       
          function (err, results)
          {
            console.log("error: ", err);
            if(results === undefined) {   results={}   }
            console.log(results);
            res.render('addInventory', { user: req.user, medicine: populateSelectValue, inventory: results});            
          })
      }
  ]); 
}
exports.addingInventory = function (req, res){
  var Inventory = {};
  Inventory.qtyIn    = req.body['qty'];  
  Inventory.userID   = req.user._id;
  Inventory.addedBy  = req.user.fullname;

  med.update({_id:req.body['itemName']},{ $push: { inventory: Inventory } }, function (err) {
    if(err) {
      console.log("Item Name not found!");
      res.redirect('addItem');
    } 
    res.redirect('/add/inventory');      
  });
}
exports.addRequest = function (req, res){
  console.log(req.user)
  res.render('request', { user: req.user });
}
exports.requestInventory = function (req, res){
  var Inventory = {};
  Inventory.qtyOut   = req.body['qty'];  
  Inventory.userID   = req.user._id;
  Inventory.addedBy  = req.user.fullname;

  med.update({_id:req.body['itemName']},{ $push: { inventory: Inventory } }, function (err) {
    if(err) {
      console.log("Item Name not found!");
      res.redirect('addItem');
    } 
    res.redirect('/add/inventory');      
  });
}

exports.confirmRequest = function (req, res){
  res.render('approvedRequest', { user: req.user });
}
exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
}
