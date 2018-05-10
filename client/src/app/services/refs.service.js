"use strict";

angular
  .module('sugg.services')
  .factory('Refs', ['fb_uri',
    function(fb_uri) {
      var rootRef = new Firebase(fb_uri);

      return {
        root: rootRef,
        notes: rootRef.child('notes'),
        users: rootRef.child('users'),
        settings: rootRef.child('settings'),
        tags: rootRef.child('tags')
      };
  }]);
