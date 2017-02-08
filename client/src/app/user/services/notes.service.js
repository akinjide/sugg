"use strict";

angular
  .module('znote.services')
  .factory('Notes', ['Refs', ,
    function(Refs) {
      var authObj;

      authObj = $firebaseArray(Refs.notes);

      return {
        create: function() {

        },

        all: function(cb) {

        },

        find: function() {

        },

        remove: function() {

        },

        edit: function() {

        },
      };
  }]);
