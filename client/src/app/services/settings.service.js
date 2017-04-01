"use strict";

angular
  .module('znote.services')
  .factory('Settings', ['Refs', '$q', '$firebaseArray', '$firebaseObject', '$firebaseAuth',
    function(Refs, $q, $firebaseArray, $firebaseObject, $firebaseAuth) {
      var time = Firebase.ServerValue.TIMESTAMP;

      return {
        add: function(uid, options) {
          var userSettings = $firebaseObject(Refs.settings.child(uid));


        },

        update: function() {

        }
      };
  }]);
