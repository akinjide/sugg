"use strict";

angular
  .module('sugg.services')
  .factory('Refs', ['keys',
    function(keys) {
      var rootRef = new Firebase(keys.firebase);

      return {
        root: rootRef,
        notes: rootRef.child('notes'),
        users: rootRef.child('users'),
        settings: rootRef.child('settings'),
        tags: rootRef.child('tags')
      };
  }]);
