"use strict";

angular
  .module('sugg.services')
  .factory('Settings', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      return {
        add: function(uid, options) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;
          var newOptions = {};
          var userSettings = $firebaseObject(Refs.settings.child(uid));

          userSettings
            .$loaded()
            .then(function() {
              if (userSettings.id === undefined) {
                newOptions = options;
                newOptions.created = time;
                newOptions.updated = time;

                userSettings
                  .$ref()
                  .set(newOptions);
              } else {
                // this.update(userSettings.$id, options);
              }

              deferred.resolve(userSettings);
            }.bind(this))
            .catch(deferred.reject);

          return deferred.promise;
        },

        update: function(uid, options) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;

          $firebaseObject(Refs.settings.child(uid))
            .$loaded()
            .then(function(settings) {
              if (options.default_layout) {
                settings.default_layout = options.default_layout;
              }

              if (options.default_note_color) {
                settings.default_note_color = options.default_note_color;
              }

              settings.updated = time;
              return settings.$save()
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        find: function(uid) {
          var deferred = $q.defer();

          $firebaseObject(Refs.settings.child(uid))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        }
      };
  }]);
