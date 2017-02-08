var Firebase = require('firebase'),
    FirebaseTokenGenerator = require('firebase-token-generator'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

// Authenticate the server to Firebase
exports.authWithCustomToken = function(cb) {
  var rootRef = new Firebase(config.firebase.rootRefUrl),
      tokenGenerator = new FirebaseTokenGenerator(config.firebase.secretKey),
      token = tokenGenerator.createToken({ uid: config.firebase.serverUID, isAdmin: true, name: 'node-server' }, { debug: true, admin: false, expires: setExpire(1) });

  rootRef.authWithCustomToken(token, function(err) {
    if (err) cb(err);
    else {
      cb(null, rootRef);
    }
  });
};

function setExpire(exdays) {
  var d = new Date();
  return d.setTime(d.getTime() + (exdays*24*60*60*1000));
  // d.toGMTString();
}