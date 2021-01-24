var models = require('../models');
var _ = require('lodash');


const parseCookies = (req, res, next) => {
  var formatCookies = (string) => {
    var data = {};
    var cookies = string.split(';');
    for ( cookie of cookies) {
      var both = cookie.split('=');
      var key = both[0];
      var value = both[1];
      if (key[0] === ' ') {
        key = key.slice(1, key.length);
      } else {
        key = key.slice(0, key.length);
      }
      value = value.slice(0, value.length);
      data[key] = value;
    }
    return data;
  };
  if (req.headers.cookie) { req.cookies = formatCookies(req.headers.cookie); }
  next();
};

module.exports = parseCookies;