/*
  define all modules
 */
angular.module('znote.services',    ['ngCookies', 'firebase', 'lumx']);
angular.module('znote.controllers', ['ngCookies']);
angular.module('znote.directives',  []);
angular.module('znote.filters',     []);

// require services
require('./services/authentication.service.js');
require('./services/notes.service.js');
require('./services/notification.service.js');
require('./services/refs.service.js');
require('./services/users.service.js');

// require directives
require('./directives/dragnote.directive.js');
require('./directives/pagetitle.directive.js');

// require controllers
require('./controllers/authentication.controller.js');
require('./controllers/main.controller.js');
require('./controllers/notes.controller.js');

window.znote = angular.module("znote", [
  'ui.bootstrap',
  'znote.controllers',
  'znote.directives',
  'znote.services',
  'angular-spinkit',
  'ui.router',
  'lumx'
]);

// firebase URL
znote.constant('fbURL', 'https://znote.firebaseio.com/')

// application routes
znote.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  'fbURL',
  function($stateProvider, $urlRouterProvider, $locationProvider, fbURL) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/404/notfound');

    $stateProvider
      .state('404', {
        url: "/404/notfound",
        templateUrl: "views/404.partial.html",
        data: {
          pageTitle: '404 - Not Found | Znote'
        }
      })
      .state('login', {
        url   : '/',
        templateUrl : 'views/login.partial.html',
        controller: 'AuthenticationController as loginVm',
        data: {
          pageTitle: 'Login | Znote'
        }
      })
      .state('notes', {
        url   : '/notes',
        views : {
          '' : {
            templateUrl : 'views/nav.partial.html'
          },
          'theView@notes' : {
            templateUrl : 'views/notes.partial.html'
          }
        },
        data: {
          pageTitle: 'Notes | Znote'
        }
        resolve: {
          // controller will not be loaded until $waitForAuth resolves
          // Auth refers to our $firebaseAuth wrapper in the example above
          "currentAuth": ['$firebaseAuth', function($firebaseAuth) {
            // $waitForAuth returns a promise so the resolve waits for it to complete
            var ref = new Firebase(fbURL);
            var authObj = $firebaseAuth(ref);

            return authObj.$requireAuth();
          }]
        }
      })
//       .state('logout', {
//         url: '/logout',
//         templateUrl: 'scripts/login-register/login-logout/logout.html',
//         controller: 'LoginCtrl',
//         resolve: {
//           logout: function(authService){
//             authService.logout();
//           }
//         }
//       })
//       .state('secure', {
//         abstract: true,
//         template: '<div ui-view>',
//         controller: 'SecureCtrl',
//         resolve: {
//           isLoggedIn: function(authService){
//             return authService.isLoggedIn();
//           }
//         }
//       });
  }]);
