(function() {
  "use strict";

  angular
    .module('znote.controllers')
    .controller('AuthenticationController', AuthenticationController)

  AuthenticationController.$inject = ['$scope', '$state', 'Authentication', 'Notification', 'User', '$rootScope'];

  function AuthenticationController ($scope, $state, Authentication, Notification, User, $rootScope) {
    var vm = this;
    vm.isLoggedIn = Authentication.isLoggedIn();

    vm.Login = function(provider) {
      Authentication.login(provider, function(e, authData) {
        if (!e) {
          var payload = Authentication.buildUserObjectFromProviders(authData);
          $rootScope.currentUser = payload

          User.create(payload, function (e, data) {
            if (e) {
              Notification.notify('error', 'Login failed. Try again...(ツ)');
              console.log('An error occurred while attempting to contact the authentication server.');
            } else {
              Notification.notify('success', 'Hi, ' + payload.display_name + '.');

              setTimeout(function() {
                Notification.notify('simple', 'Welcome to znote, get started by clicking on add note button.');
              }, 3000);

              $state.go('notes');
            }
          });
        }
        else {
          if (e == 'Error: The user cancelled authentication.' || e.code == 'USER_CANCELLED' ) {
            Notification.notify('error', 'You cancelled authentication...');
          } else if (e == 'Error: Invalid authentication credentials provided.' || e.code == 'INVALID_CREDENTIALS') {
            Notification.notify('error', 'Invalid credentials');
          } else if (e.code == 'NETWORK_ERROR') {
            console.log('An error occurred while attempting to contact the authentication server.');
          } else if (e.code == 'UNKNOWN_ERROR') {
            console.log('An unknown error occurred');
          } else if (e.code == 'USER_DENIED') {
            console.log('The user did not authorize the application.');
          } else {
            console.error(e);
            Notification.notify('error', 'Login failed. Try again...(ツ)')
          }
        }
      });
     }

     vm.logout = function() {
       Authentication.logout();
       vm.isLoggedIn = Authentication.isLoggedIn();
       $state.go('home');
       Notification.notify('sticky', 'Hi, ' + userObj.display_name + '.', true);
     }
  }
})()
