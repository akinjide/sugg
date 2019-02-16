"use strict";

angular
  .module('sugg.services')
  .factory('Tag', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      return {
        add: function(title, tagId) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;

          if (tagId) {
            this
              .find(tagId)
              .then(deferred.resolve)
              .catch(deferred.reject);
          } else {
            $firebaseArray(Refs.tags)
              .$add({
                title: title,
                updated: time,
                created: time
              })
              .then(deferred.resolve)
              .catch(deferred.reject);
          }

          return deferred.promise;
        },

        update: function(title, tagId) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;

          this
            .find(tagId)
            .then(function(tag) {
              tag.title = title;
              tag.updated = time;

              return tag.$save();
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        find: function(tagId) {
          var deferred = $q.defer();

          $firebaseObject(Refs.tags.child(tagId))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        all: function() {
          var deferred = $q.defer();

          $firebaseArray(Refs.tags)
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        }
      };
  }]);
