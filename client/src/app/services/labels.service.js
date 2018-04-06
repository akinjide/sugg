"use strict";

angular
  .module('sugg.services')
  .factory('Label', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      var time = Firebase.ServerValue.TIMESTAMP;

      return {
        add: function(title, label_id) {
          var deferred = $q.defer();
          var labels = $firebaseArray(Refs.labels);
          var self = this;

          if (label_id) {
            self.find(label_id).then(function(label) {
              deferred.resolve(label);
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          } else {
            labels.$add({
              title: title,
              updated: time,
              created: time
            }).then(function(ref) {
              deferred.resolve({ labelId: ref.key() });
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          }

          return deferred.promise;
        },

        update: function(title, label_id) {
          var deferred = $q.defer();
          var self = this;

          self.find(label_id).then(function(label) {
            label.title = title;
            label.updated = time;

            label.$save()
              .then(function(ref) {
                deferred.resolve({ labelId: ref.key() });
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

        find: function(label_id) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.labels.child(label_id));

          data.$loaded()
            .then(function(label) {
              deferred.resolve(label);
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        },

        all: function() {
          var deferred = $q.defer();
          var data = $firebaseArray(Refs.labels);

          data.$loaded()
            .then(function(labels) {
              deferred.resolve(labels);
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }
      };
  }]);
