"use strict";

angular
  .module('sugg.services')
  .factory('Settings', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      var time = Firebase.ServerValue.TIMESTAMP;

      return {
        add: function(uid, options) {
          var deferred = $q.defer();
          var newOptions = {};
          var userSettings = $firebaseObject(Refs.settings.child(uid));

          userSettings.$loaded().then(function() {
            if (userSettings.id === undefined) {

              newOptions = options;
              newOptions.created = time;
              newOptions.updated = time;

              userSettings.$ref().set(newOptions);
            } else {
              // this.update(userSettings.$id, options);
            }

            deferred.resolve(userSettings);
          }.bind(this)).catch(function(error) {
            deferred.reject(error);
          });

          return deferred.promise;
        },

        update: function(uid, options) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.settings.child(uid));

          data.$loaded()
            .then(function(settings) {
              if (options.default_layout) {
                settings.default_layout = options.default_layout;
              }

              if (options.default_note_color) {
                settings.default_note_color = options.default_note_color;
              }

              settings.updated = time;
              settings.$save().then(function(ref) {
                deferred.resolve(ref);
              })
              .catch(function(error) {
                deferred.reject(error);
              });
            })
            .catch(function(error) {
              deferred.reject(error);
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
