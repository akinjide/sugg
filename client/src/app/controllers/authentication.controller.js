(function () {
  'use strict'

  function AuthenticationController ($q, $state, $localStorage, Authentication, Notification, User, Settings, Response, SUGG_FEATURE_FLAG) {
    var vm = this
    vm.Login = Login
    vm.flags = SUGG_FEATURE_FLAG

    function Login (provider) {
      Authentication.login(provider, function (err, authData) {
        if (!err) {
          var payload = Authentication.buildUserObjectFromProviders(authData, provider)

          User.create(payload, function (err, data) {
            $localStorage.cachedUser = data

            if (err) {
              Notification.notify('error', Response.error['auth.login'])
            } else {
              if (data.is_active !== undefined && !data.is_active) {
                Authentication.logout()
                return Notification.notify('error', Response.auth['auth/account-deactivated-already-scheduled'])
              }

              Settings.find(data.$id)
                .then(function (response) {
                  if ((response && !response.created) || data.is_new) {
                    return Settings.add(data.$id, {
                      default_layout: 'list',
                      default_note_color: 'white'
                    })
                  }

                  return $q.resolve()
                })
                .then(function (response) {
                  if (data.is_active) {
                    Notification.notify('simple', 'Hi, ' + payload.name + '.', 'account', true)
                  }

                  $state.go('notes')
                })
                .catch(function () {
                  Notification.notify('error', Response.auth['auth/unknown-error'])
                  Authentication.logout()
                })
            }
          })
        } else {
          Notification.notify('error', Response.auth['auth/unknown-error'])
          // if (err === 'Error: The user cancelled authentication.' || err.code === 'USER_CANCELLED') {
          //   Notification.notify('error', Response.error['auth.cancel'])
          // } else if (err === 'Error: Invalid authentication credentials provided.' || err.code === 'INVALID_CREDENTIALS') {
          //   Notification.notify('error', Response.error['auth.invalid'])
          // } else if (err.code === 'NETWORK_ERROR') {
          //   Notification.notify('error', Response.error['auth.server'])
          // } else if (err.code === 'UNKNOWN_ERROR') {
          //   Notification.notify('error', Response.error['auth.unknown'])
          // } else if (err.code === 'USER_DENIED') {
          //   Notification.notify('error', Response.error['auth.unauthorized'])
          // } else {
          //   Notification.notify('error', Response.error['auth.login'])
          // }
        }
      })
    }
  }

  angular
    .module('sugg.controllers')
    .controller('AuthenticationController', AuthenticationController)

  AuthenticationController.$inject = ['$q', '$state', '$localStorage', 'Authentication', 'Notification', 'User', 'Settings', 'Response', 'SUGG_FEATURE_FLAG']
})()
