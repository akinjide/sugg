"use strict";

angular
  .module('sugg.services')
  .factory('Settings', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      var time = Firebase.ServerValue.TIMESTAMP;
      var userSettings;

      return {
        add: function(uid, options) {
          var deferred = $q.defer();
          var newOptions = {};
          userSettings = $firebaseObject(Refs.settings.child(uid));

          userSettings.$loaded().then(function() {
            if (userSettings.id === undefined) {

              newOptions = options;
              newOptions.created = time;
              newOptions.updated = time;

              userSettings.$ref().set(newOptions);
            } else {
              this.update(options);
            }

            deferred.resolve(userSettings);
          }.bind(this)).catch(function(error) {
            deferred.reject(error);
          });

          return deferred.promise;
        },

        update: function(options) {
          if (options) {
            userSettings.updated = time;
          }

          userSettings.$save().then(function(ref) {
            if (ref.key() === userSettings.$id) {
              // console.info(ref.key() + ' updated');
            }
          });
        },

        find: function(uid) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.settings.child(uid));

          data.$loaded()
            .then(function(settings) {
              deferred.resolve(settings);
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }
      };
  }]);
