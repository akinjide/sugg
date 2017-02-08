/*
  define all modules
 */
angular.module('znote.services',    ['ngCookies', 'firebase', 'lumx']);
angular.module('znote.controllers', []);
angular.module('znote.directives',  []);
angular.module('znote.filters',     []);

// require services
require('./scripts/services/authentication.service.js');
require('./scripts/services/notes.service.js');
require('./scripts/services/notification.service.js');
require('./scripts/services/refs.service.js');
require('./scripts/services/users.service.js');

// require directives
require('./scripts/directives/dragnote.directive.js');
require('./scripts/directives/pagetitle.directive.js');

// require controllers
require('./scripts/controllers/authentication.controller.js');
require('./scripts/controllers/main.controller.js');
require('./scripts/controllers/notes.controller.js');

window.znote = angular.module("znote", [
  'ui.bootstrap',
  'znote.controllers',
  'znote.directives',
  'znote.services',
  'angular-spinkit',
  'ui.router'
]);

// firebase URL
znote.constant('firebaseURL', 'https://znote.firebaseio.com/')

// application routes
znote.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  'firebaseURL',
  function($stateProvider, $urlRouterProvider, $locationProvider, firebaseURL) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/404/notfound');
    $stateProvider
      .state('404', {
        url: "/404/notfound",
        templateUrl: "partials/404.partial.html",
        data: {
          pageTitle: '404 - Not Found | Znote'
        }
      })
      .state('login', {
        url   : '/',
        templateUrl : 'partials/login.partial.html',
        controller: 'AuthenticationController as loginVm',
        data: {
          pageTitle: 'Login | Znote'
        }
      })
      .state('notes', {
        url   : '/notes',
        views : {
          '' : {
            templateUrl : 'partials/nav.partial.html'
          },
          'theView@notes' : {
            templateUrl : 'partials/notes.partial.html'
          }
        },
        data: {
          pageTitle: 'Notes | Znote'
        }
        // resolve: {
        //   // controller will not be loaded until $waitForAuth resolves
        //   // Auth refers to our $firebaseAuth wrapper in the example above
        //   "currentAuth": ['$firebaseAuth', function($firebaseAuth) {
        //     // $waitForAuth returns a promise so the resolve waits for it to complete
        //     var ref = new Firebase(firebaseURL);
        //     var authObj = $firebaseAuth(ref);

        //     return authObj.$requireAuth();
        //   }]
        // }
      });
}]);
