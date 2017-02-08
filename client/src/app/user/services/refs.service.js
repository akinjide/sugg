"use strict";

angular
  .module('znote.services')
  .factory('Refs', ['firebaseURL',
    function(firebaseURL) {
      var rootRef = new Firebase(firebaseURL);

      return {
        root: rootRef,
        notes: rootRef.child('notes'),
        admin: rootRef.child('admin'),
        users: rootRef.child('users')
      };
  }]);
