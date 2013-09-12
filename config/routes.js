
/**
 * Module dependencies.
 */
var sessionController		= require('../controllers/session');
var authenticate 			= require('../controllers/authenticate');

// Expose
module.exports = function (app, passport) {	
	app.get('/', sessionController.home);
	app.get('/login', sessionController.login);
	app.post('/login', sessionController.handlelogin);
	app.get('/register', sessionController.register);
	app.post('/register', sessionController.registerNew);
	// app.get('/list/users', authenticate.isAdminAuthenticated, sessionController.listofusers);
	app.get('/confirm/request', authenticate.isAdminAuthenticated, sessionController.confirmRequest);	
	app.get('/addItem', authenticate.isAdminAuthenticated, sessionController.itemDisplay);
	app.post('/addItem', authenticate.isAdminAuthenticated, sessionController.addItem);
	app.get('/add/inventory', authenticate.isAdminAuthenticated, sessionController.inventoryDisplay);
	app.post('/add/inventory', authenticate.isAdminAuthenticated, sessionController.addingInventory);
	app.get('/logout', sessionController.logout);
}




