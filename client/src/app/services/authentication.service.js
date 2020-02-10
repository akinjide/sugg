'use strict'

angular
  .module('sugg.services')
  .factory('Authentication', ['Refs', '$firebaseAuth', '$rootScope', '$localStorage',
    function (Refs, $firebaseAuth, $rootScope, $localStorage) {
      return {
        /**
         * @param  {provider} Provider can be Facebook, Google or Twitter
         * @param  {Function}
         * @return {Object} AuthData from Firebase or Error if any occurs
         */
        login: function (provider, callback) {
          var authObj = $firebaseAuth()
          var query

          switch (provider) {
            case 'facebook.com':
              query = new firebase.auth.FacebookAuthProvider()
              query.addScope('email')
              query.setCustomParameters({
                remember: 'sessionOnly'
              })

              break

            case 'google.com':
              query = new firebase.auth.GoogleAuthProvider()
              query.addScope('https://www.googleapis.com/auth/userinfo.email')
              query.addScope('https://www.googleapis.com/auth/userinfo.profile')
              query.setCustomParameters({
                remember: 'sessionOnly'
              })

              break

            case 'twitter.com':
              query = new firebase.auth.TwitterAuthProvider()
              query.setCustomParameters({
                remember: 'sessionOnly'
              })

              break

            default:
              return callback(new Error('Provider required'))
          }

          /**
           * Authenticates the client using a popup-based OAuth flow
           * @param  {provider} OAuth provider
           * @return {authData} object containing authentication data about the logged-in user
           */
          authObj
            .$signInWithPopup(query)
            .then(function (authData) {
              console.log(authData)
              callback(null, authData)
            })
            //  If unsuccessful, the promise will be rejected with an Error object
            .catch(function (error) {
              // console.log(error, 'line 57')
              callback(error)

              // if (error) {
              //   if (error.code === 'TRANSPORT_UNAVAILABLE') {
              //     /**
              //      * fall-back to browser redirects, and pick up the session
              //      * automatically when we come back to the origin page
              //      */
              //     authObj
              //       .$signInWithRedirect('google')
              //       .then(function (authData) {
              //         console.log('yeet')
              //         console.log(error, authData, 'line 69')

              //         // callback(error, authData)
              //       })
              //       .catch(function (error) {
              //         console.log(error, 'line 69')
              //         // callback(error)
              //       })

              //     self
              //       .authenticatedUserChange(function (user) {
              //         console.log(user, 'line 82')
              //       }, self)
              //   } else {
              //     callback(error)
              //   }
              // }
            })
        },

        /**
         * @param  {authData} object containing authentication data about the logged-in user
         * @return {Object} containing filter logged-in user data
         */
        buildUserObjectFromProviders: function (authData, provider) {
          if (!authData) {
            return
          }

          function modifyProfile (user, credential, profile, providerId) {
            var providerData = user.providerData[0]

            if (providerData) {
              var base = {
                uid: user.uid,
                name: providerData.displayName,
                image: providerData.photoURL,
                email: providerData.email,
                id: providerData.uid
              }

              if (!providerId) {
                providerId = providerData.providerId
              }

              if (credential) {
                base.token = credential.accessToken
              }

              switch (providerId) {
                case 'facebook.com':
                  base.provider = 'facebook'

                  if (profile) {
                    base.given_name = profile.first_name
                    base.family_name = profile.last_name
                  }

                  break
                case 'twitter.com':
                  base.provider = 'twitter'

                  break
                case 'google.com':
                  base.provider = 'google'

                  if (profile) {
                    base.given_name = profile.given_name
                    base.family_name = profile.family_name
                  }

                  break
              }

              return base
            }

            return {}
          }

          var additional = authData.additionalUserInfo || null
          var additionalProfile = (additional && additional.profile) || null
          var credential = authData.credential || null
          var user = authData.user || authData

          var profile = modifyProfile(user, credential, additionalProfile, provider)
          var defaultProfile = {
            created: firebase.database.ServerValue.TIMESTAMP,
            is_active: true,
            is_new: true,
            suspended: null
          }

          return Object.assign({}, defaultProfile, profile)
        },
        /**
         * Unauthenticates from the Firebase database. It returns no value.
         *
         * @return {Promise} null
         */
        logout: function () {
          $rootScope.currentUser = null
          $localStorage.cachedUser = null

          return $firebaseAuth().$signOut()
        },
        isLoggedIn: function () {
          if ($firebaseAuth().$getAuth()) {
            return true
          }

          return false
        },
        authenticatedUser: function () {
          var authObj = $firebaseAuth()

          if (this.isLoggedIn()) {
            return $localStorage.cachedUser || this.buildUserObjectFromProviders(authObj.$getAuth())
          }

          return this.buildUserObjectFromProviders(authObj.$getAuth())
        },
        /**
         * Unauthenticates from the Firebase database. It returns no value.
         *
         * @param {Function} user fields
         * @param {Function} unregister the observer hook
         * @return {null}
         */
        authenticatedUserChange: function (callback, context, handsOff) {
          var offAuthChange = $firebaseAuth().$onAuthStateChanged(callback, context)

          if (handsOff) {
            return handsOff(offAuthChange)
          }
        }
      }
    }
  ])
