var Firebase = require('firebase');
var FirebaseTokenGenerator = require('firebase-token-generator');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];
var rootRef = new Firebase(config.firebase.rootRefUrl);
var tokenGenerator = new FirebaseTokenGenerator(config.firebase.secretKey);

exports.authWithCustomToken = function(token, callback) {
  rootRef.authWithCustomToken(token, function(error, data) {
    if (error) return callback(error);
    if (data.auth.uid != config.firebase.serverUID) return callback('invalid token');

    callback(null, data, rootRef);
  });
};

exports.generateToken = function(data, callback) {
  var token = tokenGenerator.createToken({
    uid: config.firebase.serverUID,
    isAdmin: true,
    name: 'sugg:server',
    payload: data
  }, {
    debug: true,
    admin: false,
    expires: t().add(1, 'days').unix()
  });

  if (!token) return callback('error when generating token');
  callback(null, token);
}

exports.rootRef = rootRef;