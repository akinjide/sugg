(function() {
  "use strict";

  angular
    .module('znote.controllers')
    .controller('AuthenticationController', AuthenticationController)

  AuthenticationController.$inject = ['$state', '$localStorage', 'Authentication', 'Notification', 'User', 'Settings'];

  function AuthenticationController ($state, $localStorage, Authentication, Notification, User, Settings) {
    var vm = this;
    vm.Login = Login;

    function Login(provider) {
      Authentication.login(provider, function(err, authData) {
        if (!err) {
          var payload = Authentication.buildUserObjectFromProviders(authData);

          User.create(payload, function (err, data) {
            $localStorage.cachedUser = data;

            if (err) {
              Notification.notify('error', 'Login failed. Try again...(ツ)');
            } else {
              Settings.add(data.$id, {
                defaultLayout: 'list-view',
                defaultNoteColor: 'white'
              });

              if (data && data.is_active) {
                Notification.notify('success', 'Hi, ' + payload.name + '.');
                $state.go('notes');
              } else {
                Authentication.logout();
                $state.go('login');
                Notification.notify('error', 'Login failed. This account has been deactivated. :( Contact Support.');
              }
            }
          });
        } else {
          if (err == 'Error: The user cancelled authentication.' || err.code == 'USER_CANCELLED' ) {
            Notification.notify('error', 'You cancelled authentication...');
          } else if (err == 'Error: Invalid authentication credentials provided.' || err.code == 'INVALID_CREDENTIALS') {
            Notification.notify('error', 'Invalid credentials');
          } else if (err.code == 'NETWORK_ERROR') {
            Notification.notify('error', 'An error occurred while attempting to contact the authentication server.');
          } else if (err.code == 'UNKNOWN_ERROR') {
            Notification.notify('error', 'Unknown error. Try again...(ツ)');
          } else if (err.code == 'USER_DENIED') {
            Notification.notify('error', 'The user did not authorize the application.');
          } else {
            console.error(err);
            Notification.notify('error', 'Login failed. Try again...(ツ)')
          }
        }
      });
    }
  }
})()
