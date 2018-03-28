"use strict";

angular
  .module('sugg.services')
  .factory('Settings', ['Refs', '$q', '$firebaseArray', '$firebaseObject', '$firebaseAuth',
    function(Refs, $q, $firebaseArray, $firebaseObject, $firebaseAuth) {
      var time = Firebase.ServerValue.TIMESTAMP;
      var newOptions = {};
      var userSettings;

      return {
        add: function(uid, options) {
          var deferred = $q.defer();
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
//               console.info(ref.key() + ' updated');
            }
          });
        },

        find: function(uid) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.settings.child(uid));

          if (!_.isEmpty(data)) {
            data.$loaded()
              .then(function(settings) {
                deferred.resolve(settings);
              })
              .catch(function(error) {
                deferred.reject(error);
              });

          } else {
            deferred.reject('Settings not found.');
          }

          return deferred.promise;
        }
      };
  }]);
