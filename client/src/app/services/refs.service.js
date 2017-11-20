"use strict";

angular
  .module('znote.services')
  .factory('Refs', ['fbURL',
    function(fbURL) {
      var rootRef = new Firebase(fbURL);

      return {
        root: rootRef,
        notes: rootRef.child('notes'),
        users: rootRef.child('users'),
        settings: rootRef.child('settings')
      };
  }]);
