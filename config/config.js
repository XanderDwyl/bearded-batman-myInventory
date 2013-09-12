
/*!
 * Module dependencies.
 */
var path = require('path')
var rootPath = path.resolve(__dirname + '../..')

// Expose config 
module.exports = {
  development: {
    root: rootPath,
    db: 'mongodb://localhost/dbMMInventory'
  },
  test: {
    root: rootPath,
    db: 'mongodb://localhost/dbMMInventory'
  }
}
