var async = require('async'),
    Firebase = require('firebase');

module.exports = function(router, rootRef) {
  var noteRef = rootRef.child('notes');

  return router;
};