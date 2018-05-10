"use strict";

angular
  .module('sugg.services')
  .factory('Tag', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      var time = Firebase.ServerValue.TIMESTAMP;

      return {
        add: function(title, tag_id) {
          var deferred = $q.defer();
          var tags = $firebaseArray(Refs.tags);
          var self = this;

          if (tag_id) {
            self.find(tag_id).then(function(tag) {
              deferred.resolve(tag);
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          } else {
            tags.$add({
              title: title,
              updated: time,
              created: time
            }).then(function(ref) {
              deferred.resolve({ tagId: ref.key() });
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          }

          return deferred.promise;
        },

        update: function(title, tag_id) {
          var deferred = $q.defer();
          var self = this;

          self.find(tag_id).then(function(tag) {
            tag.title = title;
            tag.updated = time;

            tag.$save()
              .then(function(ref) {
                deferred.resolve({ tagId: ref.key() });
              })
              .catch(function(error) {
                deferred.reject(error);
              });
          })
          .catch(function(error) {
            deferred.reject(error);
          });

          return deferred.promise;
        },

        find: function(tag_id) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.tags.child(tag_id));

          data.$loaded()
            .then(function(tag) {
              deferred.resolve(tag);
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        },

        all: function() {
          var deferred = $q.defer();
          var data = $firebaseArray(Refs.tags);

          data.$loaded()
            .then(function(tags) {
              deferred.resolve(tags);
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }
      };
  }]);
