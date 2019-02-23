(function () {
  'use strict'

  function ProfileController ($q, $state, $controller, Authentication, Notification, User, Response, currentAuth) {
    var vm = this

    vm._main = $controller('MainController', {})
    vm.isLoggedIn = vm._main.isLoggedIn
    if (vm.isLoggedIn) {
      vm.currentUser = vm._main.currentUser
    }

    vm.IncludeEmail = IncludeEmail
    vm.Deactivate = Deactivate
    vm.Logout = Logout

    /// //////////////////

    activate()

    function activate () {
      var promises = []

      return $q.all(promises)
        .then(function () {
        })
        .catch(function () {
          Notification.notify('error', Response.core['core/page-loading-failed'])
        })
    }

    /// //////////////////

    // Use three-way binding
    // https://github.com/firebase/angularfire/blob/master/docs/quickstart.md#5-add-three-way-object-bindings
    // https://github.com/firebase/angularfire/blob/master/docs/guide/synchronized-objects.md#meta-fields-on-the-object
    function IncludeEmail (uid, mail) {
      User
        .addEmail(uid, mail)
        .then(function () {
          Notification.notify('simple', Response.auth['auth/email-update-success'])
        })
        .catch(function () {
          Notification.notify('error', Response.core['core/internal-server-failed'])
        })
    }

    function Deactivate (uid) {
      User
        .remove(uid)
        .then(function () {
          Logout()
          Notification.notify('simple', Response.auth['auth/account-deactivated-scheduled'])
        })
        .catch(function () {
          Notification.notify('error', Response.core['core/internal-server-failed'])
        })
    }

    function Logout () {
      Notification.notify('sticky', Response.auth['auth/log-out-success'])
      Authentication.logout()
      $state.go('login')
    }
  }

  angular
    .module('sugg.controllers')
    .controller('ProfileController', ProfileController)

  ProfileController.$inject = ['$q', '$state', '$controller', 'Authentication', 'Notification', 'User', 'Response', 'currentAuth']
})()
