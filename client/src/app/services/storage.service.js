"use strict";

angular
  .module('sugg.services')
  .factory('Storage', ['Refs', '$q', '$firebaseStorage',
    function(Refs, $q, $firebaseStorage) {
      return {
        add: function(uid, file, filename, metadata) {
          var deferred = $q.defer();

          var task = $firebaseStorage(Refs.images.child(uid).child(filename))
            .$put(file, metadata);

          task
            .$complete(deferred.resolve);

          task
            .$error(deferred.reject);

          task
            .$progress(function(snapshot) {
              deferred.notify(parseInt(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100.0
              ));
            });

          return deferred.promise;
        },
        remove: function(uid, filename) {
          var deferred = $q.defer();

          $firebaseStorage(Refs.images.child(uid).child(filename))
            .$delete()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },
        get: function(uid, filename) {
          var deferred = $q.defer();
          var path = $firebaseStorage(Refs.images.child(uid).child(filename));

          $q.all([
            path.$getDownloadURL(),
            path.$getMetadata()
          ])
          .then(deferred.resolve)
          .catch(deferred.reject);

        return deferred.promise;

        },
        edit: function(uid, filename, metadata) {
          var deferred = $q.defer();

          $firebaseStorage(Refs.images.child(uid).child(filename))
            .$updateMetadata(metadata)
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        }
      }
  }]);
