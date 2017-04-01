(function() {
  "use strict";

  angular
    .module('znote.controllers')
    .controller('MainController', MainController)

  MainController.$inject = ['$rootScope', '$q', '$state', 'Authentication', 'Notification', 'User', 'cfpLoadingBar'];

  function MainController ($rootScope, $q, $state, Authentication, Notification, User, cfpLoadingBar) {
    var vm = this;

    vm.isLoggedIn = $rootScope.isLoggedIn;
    vm.listView = false;

    if (vm.isLoggedIn) {
      vm.currentUser = $rootScope.currentUser;
    }

    vm.Refresh = Refresh;
    vm.Deactivate = Deactivate;
    vm.Logout = Logout;

//     cfpLoadingBar.start();
    activate();

    function activate() {
      var promises = [];

      return $q.all(promises)
        .then(function() {
//           cfpLoadingBar.complete();
        })
        .catch(function(err) {
          Notification.notify('error', 'Error while loading. Try again...(ツ)');
        })
    }

    function Refresh() {
      $state.reload();
    }

    function Deactivate(uid) {
      User.remove(uid)
        .then(function(data) {
          $state.go('login');
          Notification.notify('simple', 'Account Deactivate Successfully! :( Sad to see you leave');
        })
        .catch(function(err) {
          $state.go('login');
          Notification.notify('error', 'It\'s our fault. Please try again.');
        });
    }

    function Logout() {
      Notification.notify('sticky', 'Successfully Signed Out! :)');
      Authentication.logout();
      $state.go('login');
    }
  }
})()