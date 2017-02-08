"use strict";

angular
  .module('znote.services')
  .factory('User', ['Refs', '$cookies', '$firebaseArray', '$firebaseObject',
    function(Refs, $cookies, $firebaseArray, $firebaseObject) {
      var user, e,
          newUser = {};

      return {
        create: function(authData, cb) {
          e = null;

          if (!authData) cb(e);

          if (!cb) return 'A callback function is required.';

          user = $firebaseObject(Refs.users.child(authData.uid));
          $cookies.put('user', authData.uid);

          user.$loaded().then(function() {
            console.log('yeet', user);
            if (user.id == undefined) {
              // create user record depending on available field
              if (authData.email) newUser.email = authData.email;

              newUser.access_token  = authData.access_token,
              newUser.created_at    = authData.created_at,
              newUser.image_URL     = authData.picture_img_url,
              newUser.name          = authData.display_name,
              newUser.id            = authData.id;

              // save user to firebase collection under the user node
              user.$ref().set(newUser);
            }
            else {
              this.update(authData)
            }

            // ...and we return the user when done
            return cb(e, user)
          }.bind(this)).catch(function(e) {
            cb(e)
          });
        },

        update: function(authData) {
          // update user access token
          if (authData.provider)
            user.access_token  = authData.access_token;
            user.updated_at    = authData.created_at;

          user.$save().then(function(ref) {
            if (ref.key() === user.$id)
              console.info(ref.key() + ' updated');
          });
        },

        remove: function(uid, cb) {
          user = $firebaseObject(Refs.users.child(uid));

          user.$remove().then(function(ref) {
            e = null;
            cb(e, 'Data has been deleted locally and in the database')
          }, function(e) {
            cb(e)
          });
        },

        all: function(cb) {
          var users;

          users = $firebaseArray(Refs.users);
          if (!cb) {
            return users;
          }
          else {
            Refs.users.once('value', function(snap) {
              e = null;
              if (snap.exists()) {
                cb(e, snap.val());
              }
              else {
                e = 'no data found in the database';
                cb(e)
              }
            });
          }
        },

        find: function(uid, cb) {
          if (!cb) {
            return $firebaseObject(Refs.users.child(uid));
          }
          else {
            Refs.users.child(uid).once('value', function(snap) {
              e = null;
              if (snap.exists()) {
                cb(e, snap.val());
              }
              else {
                e = 'no data found in the database';
                cb(e);
              }
            });
          }
        }
      };
  }]);
