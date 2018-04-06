(function() {
  "use strict";

  function ProfileController ($rootScope, $q, $state, $window, $controller, Authentication, Notification, User, Response) {
    var vm = this;

    vm._main = $controller('MainController', {});
    vm.isLoggedIn = vm._main.isLoggedIn;
    if (vm.isLoggedIn) {
      vm.currentUser = vm._main.currentUser;
    }

    vm.Deactivate = Deactivate;
    vm.Logout = Logout;

    /////////////////////

    activate();


    function activate() {
      var promises = [];

      return $q.all(promises)
        .then(function() {
        })
        .catch(function() {
          Notification.notify('error', Response.error['page']);
        });
    }

    /////////////////////


    function Deactivate(uid) {
      User.remove(uid)
        .then(function() {
          Notification.notify('simple', Response.warn['auth.deactivated']);
        })
        .catch(function() {
          Notification.notify('error', Response.error['server.internal']);
        });

        $state.go('login');
    }


    function Logout() {
      Notification.notify('sticky', Response.success['auth.logout']);
      Authentication.logout();
      $state.go('login');
    }
  }

  angular
    .module('sugg.controllers')
    .controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$rootScope', '$q', '$state', '$window', '$controller', 'Authentication', 'Notification', 'User', 'Response'];
})();