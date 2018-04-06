(function() {
  "use strict";

  function AuthenticationController ($state, $localStorage, Authentication, Notification, User, Settings, Response) {
    var vm = this;
    vm.Login = Login;

    function Login(provider) {
      Authentication.login(provider, function(err, authData) {
        if (!err) {
          var payload = Authentication.buildUserObjectFromProviders(authData);

          User.create(payload, function (err, data) {
            $localStorage.cachedUser = data;

            if (err) {
              Notification.notify('error', Response.error['auth.login']);
            } else {
              Settings.add(data.$id, {
                defaultLayout: 'list-view',
                defaultNoteColor: 'white'
              });

              if (data.is_active) {
                Notification.notify('sticky', 'Hi, ' + payload.name + '.', 'account', true);
              }

              $state.go('notes');
            }
          });
        } else {
          if (err == 'Error: The user cancelled authentication.' || err.code == 'USER_CANCELLED' ) {
            Notification.notify('error', Response.error['auth.cancel']);
          } else if (err == 'Error: Invalid authentication credentials provided.' || err.code == 'INVALID_CREDENTIALS') {
            Notification.notify('error', Response.error['auth.invalid']);
          } else if (err.code == 'NETWORK_ERROR') {
            Notification.notify('error', Response.error['auth.server']);
          } else if (err.code == 'UNKNOWN_ERROR') {
            Notification.notify('error', Response.error['auth.unknown']);
          } else if (err.code == 'USER_DENIED') {
            Notification.notify('error', Response.error['auth.unauthorized']);
          } else {
            Notification.notify('error', Response.error['auth.login']);
          }
        }
      });
    }
  }

  angular
    .module('sugg.controllers')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$state', '$localStorage', 'Authentication', 'Notification', 'User', 'Settings', 'Response'];
})();
