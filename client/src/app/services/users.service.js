"use strict";

angular
  .module('sugg.services')
  .factory('User', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      var user;

      return {
        create: function(authData, callback) {
          var newUser = {};
          user = $firebaseObject(Refs.users.child(authData.uid));

          user
            .$loaded()
            .then(function() {
              if (user.id === undefined) {
                if (authData.email) {
                  newUser.email = authData.email;
                }

                newUser.token  = authData.token;
                newUser.created = authData.created;
                newUser.image = authData.image;
                newUser.name = authData.name;
                newUser.id = authData.id;
                newUser.is_active = authData.is_active;
                newUser.is_new = authData.is_new;
                newUser.suspended = authData.suspended;
                newUser.provider = authData.provider;

                // save user to firebase collection under the user node
                user
                  .$ref()
                  .set(newUser);
              } else {
                return this.update(authData, callback);
              }

              // ...and we return the user when done
              return callback(null, user);
            }.bind(this))
            .catch(function(error) {
              callback(error);
            });
        },

        update: function(authData, callback) {
          // update user information
          if (authData.provider) {
            user.token = authData.token;
            user.image = authData.image;
            user.updated = authData.created;
            user.is_new = false;

            if (!user.provider) {
              user.provider = authData.provider;
            }
          }

          user
            .$save()
            .then(function(ref) {
              if (ref.key === user.$id) {
                callback(null, user);
              }
            })
            .catch(callback);
        },

        remove: function(uid) {
          var deferred = $q.defer();
          var time = firebase.database.ServerValue.TIMESTAMP;

          $firebaseObject(Refs.users.child(uid))
            .$loaded()
            .then(function() {
              user.is_active = false;
              user.suspended = time;

              return user.$save();
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        all: function() {
          var deferred = $q.defer();

          $firebaseArray(Refs.users)
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        find: function(uid) {
          var deferred = $q.defer();

          $firebaseObject(Refs.users.child(uid))
            .$loaded()
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        },

        addEmail: function(uid, email) {
          var deferred = $q.defer();

          $firebaseObject(Refs.users.child(uid))
            .$loaded()
            .then(function(user) {
              user.email = email;
              return user.$save();
            })
            .then(deferred.resolve)
            .catch(deferred.reject);

          return deferred.promise;
        }
      };
  }]);
