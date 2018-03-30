(function() {
  "use strict";

  angular
    .module('sugg.controllers')
    .controller('MainController', MainController)

  MainController.$inject = ['$rootScope', '$q', '$state', '$window', '$localStorage', 'Authentication', 'Notification', 'User'];

  function MainController ($rootScope, $q, $state, $window, $localStorage, Authentication, Notification, User) {
    var vm = this;

    vm.isLoggedIn = Authentication.isLoggedIn();
    vm.View = $localStorage.view || 'list-view';

    if (vm.isLoggedIn) {
      vm.currentUser = Authentication.authenticatedUser();
    }

    vm.Refresh = Refresh;
    vm.Logout = Logout;
    vm.changeView = changeView;
    vm.searchFilterChange = searchFilterChange;

    /////////////////////

    activate();


    function activate() {
      var promises = [];

      return $q.all(promises)
        .then(function() {})
        .catch(function(err) {
          Notification.notify('error', 'Error while loading. Try again...(ツ)');
        })
    }

    /////////////////////


    function changeView(viewType) {
      if (viewType === 'list-view') {
        vm.View = 'masonry-brick'
        $localStorage.view = 'masonry-brick';
      } else {
        vm.View = 'list-view'
        $localStorage.view = 'list-view';
      }

      Reload();
    }

    function Refresh() { $window.location.reload(); }
    function Reload() { $state.reload(); }
    function searchFilterChange(search) {
      $rootScope.$broadcast('filterSearch', search);
    }

    function Logout() {
      Notification.notify('sticky', 'Successfully Signed Out :)');
      Authentication.logout();
      $state.go('login');
    }
  }
})()