"use strict";

angular
  .module('znote.services')
  .factory('Authentication', ['Refs', '$firebaseAuth', '$rootScope',
    function(Refs, $firebaseAuth, $rootScope) {
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
            console.log(authData);
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

        isAdmin: function (usersEmail, cb) {
          e = null;

          if (!usersEmail) cb(e);

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
          })
        },

        /**
         * @param  {authData} object containing authentication data about the logged-in user
         * @return {Object} containing filter logged-in user data
         */
        buildUserObjectFromProviders: function(authData) {
          var social_provider = getName(authData);

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
            uid : authData.uid,
            provider : authData.provider,
            display_name : authData[social_provider].displayName,
            picture_img_url : authData[social_provider].profileImageURL,
//             name: {
//               first: ,
//               last: ,
//             },
            email : authData[social_provider].email,
            access_token : authData[social_provider].accessToken,
            id : authData[social_provider].cachedUserProfile.id,
            created_at: Firebase.ServerValue.TIMESTAMP
          }
        },

        /**
         * @return {unauth} Unauthenticates from the Firebase database. It returns no value.
         */
        logout: function() {
          authObj = $firebaseAuth(Refs.root);
          authObj.$unauth();
          $rootScope.currentUser = null;
        }
      };
  }]);
