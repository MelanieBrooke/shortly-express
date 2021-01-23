const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  res.end();
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

