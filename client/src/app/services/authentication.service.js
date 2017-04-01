"use strict";

angular
  .module('znote.services')
  .factory('Authentication', ['Refs', '$firebaseAuth', '$rootScope', '$localStorage',
    function(Refs, $firebaseAuth, $rootScope, $localStorage) {
      var e, authObj;

      return {
        /**
         * @param  {provider} Provider can be Facebook, Google or Twitter
         * @param  {Function}
         * @return {Object} AuthData from Firebase or Error if any occurs
         */
        login: function(provider, cb) {
          var authObj = $firebaseAuth(Refs.root),
          fb_option = {
            remember : "sessionOnly",
            scope    : "email,user_likes,user_friends"
          },
          google_option = {
            remember : "sessionOnly",
            scope    : "email"
          },
          query = provider == "facebook"
            ? fb_option
            : provider == "google"
              ? google_option
              : {
                  remember : "sessionOnly"
                };

          /**
           * Authenticates the client using a popup-based OAuth flow
           * @param  {provider} OAuth provider
           * @return {authData} object containing authentication data about the logged-in user
           */
          authObj.$authWithOAuthPopup(provider, query).then(function(authData) {
            e = null;

            if (cb) cb(e, authData);
          })
          //  If unsuccessful, the promise will be rejected with an Error object
          .catch(function(e) {
            if (e) {
              if (e.code === 'TRANSPORT_UNAVAILABLE') {
                /**
                 * fall-back to browser redirects, and pick up the session
                 * automatically when we come back to the origin page
                 */
                authObj.$authWithOAuthRedirect(provider).then(function(authData) {
                  if (cb) cb(e, authData);
                })
                .catch(function(e) {
                  if (cb) cb(e)
                })
              }
              else {
                if (cb) cb(e)
              }
            }
          })
        },

        isAdmin: function (userEmail, cb) {
          e = null;
          if (!userEmail) cb(e);

          if (!cb) return 'A callback function is needed.';

          Refs.admin.once('value', function (snap) {
            var admins = snap.val();

            for (var email in admins) {
              if (admins.hasOwnProperty(email)) {
                if (admins[email] == usersEmail) {
                  cb(e, true)
                  return true;
                }
              }
            }
            cb(e, false)
          });
        },

        /**
         * @param  {authData} object containing authentication data about the logged-in user
         * @return {Object} containing filter logged-in user data
         */
        buildUserObjectFromProviders: function(authData) {
          var socialProvider = getName(authData);

          // return a suitable name based on the meta info given by each provider
          function getName(authData) {
            switch(authData.provider) {
             case 'facebook':
              return "facebook";
              break;
             case 'twitter':
              return "twitter";
              break;
             case 'google':
              return "google";
              break;
            }
          }

          return {
            uid: authData.uid,
            provider: authData.provider,
            name: authData[socialProvider].displayName,
            image_URL: authData[socialProvider].profileImageURL,
//             name: {
//               first: ,
//               last: ,
//             },
            email: authData[socialProvider].email,
            access_token: authData[socialProvider].accessToken,
            id: authData[socialProvider].cachedUserProfile.id,
            created: Firebase.ServerValue.TIMESTAMP,
            is_active: true,
            is_new: true,
            suspended: null
          }
        },

        /**
         * @return {unauth} Unauthenticates from the Firebase database. It returns no value.
         */
        logout: function() {
          authObj = $firebaseAuth(Refs.root);
          authObj.$unauth();
          $rootScope.currentUser = null;
          $localStorage.cachedUser = null;
        },

        isLoggedIn: function() {
          var authObj = $firebaseAuth(Refs.root);

          return authObj.$getAuth() ? true : false;
        },

        authenticatedUser: function() {
          var authObj = $firebaseAuth(Refs.root);

          return $localStorage.cachedUser || this.buildUserObjectFromProviders(authObj.$getAuth());
        }
      };
  }]);
