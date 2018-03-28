"use strict";

angular
  .module('sugg.services')
  .factory('User', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      var time = Firebase.ServerValue.TIMESTAMP;
      var user, newUser = {};

      return {
        create: function(authData, cb) {
          user = $firebaseObject(Refs.users.child(authData.uid));

          user.$loaded().then(function() {
            if (user.id === undefined) {
              // create user record depending on available field
              if (authData.email) {
                newUser.email = authData.email;
              }

              newUser.access_token  = authData.access_token;
              newUser.created = authData.created;
              newUser.image_url = authData.image_URL;
              newUser.name = authData.name;
              newUser.id = authData.id;
              newUser.is_active = authData.is_active;
              newUser.is_new = authData.is_new;
              newUser.suspended = authData.suspended;

              // save user to firebase collection under the user node
              user.$ref().set(newUser);
            }
            else {
              this.update(authData);
            }

            // ...and we return the user when done
            return cb(null, user);
          }.bind(this)).catch(function(error) {
            cb(null);
          });
        },

        update: function(authData) {
          // update user access token
          if (authData.provider) {
            user.access_token = authData.access_token;
            user.updated = authData.created;
            user.is_new = false;
          }

          user.$save().then(function(ref) {
            if (ref.key() === user.$id) {
//               console.info(ref.key() + ' updated');
            }
          });
        },

        remove: function(uid) {
          var deferred = $q.defer();
          var user = $firebaseObject(Refs.users.child(uid));

          user.$loaded().then(function() {
            user.is_active = false;
            user.suspended = time;

            user.$save().then(function(ref) {
              if (ref.key() === user.$id) {
                deferred.resolve({ id: ref.key() + ' updated', message: 'Data has been deleted locally and in the database' } );
              }
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

        all: function() {
          var deferred = $q.defer();
          var data = $firebaseArray(Refs.users);

          if (!_.isEmpty(data)) {
            data.$loaded()
              .then(function(users) {
                deferred.resolve(users);
              })
              .catch(function(error) {
                deferred.reject(error);
              });
          } else {
            deferred.reject([]);
          }

          return deferred.promise;
        },

        find: function(uid) {
          var deferred = $q.defer();
          var data = Refs.users.child(uid);

          if (!_.isEmpty(data)) {
            data.$loaded()
              .then(function(user) {
                deferred.resolve(user);
              })
              .catch(function(error) {
                deferred.reject(error);
              });
          } else {
            deferred.reject('User not found.');
          }

          return deferred.promise;
        }
      };
  }]);
