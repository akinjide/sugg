(function() {
  "use strict";

  angular
    .module('znote.controllers')
    .controller('AuthenticationController', AuthenticationController)

  AuthenticationController.$inject = ['$state', 'Authentication', 'Notification', 'User', '$localStorage'];

  function AuthenticationController ($state, Authentication, Notification, User, $localStorage) {
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
              console.log('An error occurred while attempting to contact the authentication server.');
            } else {
//               console.log(data.is_active, data)
//               if (data && data.is_active) {
                Notification.notify('success', 'Hi, ' + payload.name + '.');
                $state.go('notes');
//               } else {
//                 Authentication.logout();
//                 $state.go('login');
//                 Notification.notify('error', 'Login failed. This account has been deactivated. :( Contact Support.');
//               }
            }
          });
        } else {
          if (err == 'Error: The user cancelled authentication.' || err.code == 'USER_CANCELLED' ) {
            Notification.notify('error', 'You cancelled authentication...');
          } else if (err == 'Error: Invalid authentication credentials provided.' || err.code == 'INVALID_CREDENTIALS') {
            Notification.notify('error', 'Invalid credentials');
          } else if (err.code == 'NETWORK_ERROR') {
            Notification.notify('error', 'An error occurred while attempting to contact the authentication server.');
            console.log('An error occurred while attempting to contact the authentication server.');
          } else if (err.code == 'UNKNOWN_ERROR') {
            console.log('An unknown error occurred');
          } else if (err.code == 'USER_DENIED') {
            console.log('The user did not authorize the application.');
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
