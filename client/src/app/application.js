"use strict";

/**
 * define all modules
 */
angular.module('znote.services',    ['firebase', 'lumx']);
angular.module('znote.controllers', ['ngStorage', 'cfp.loadingBar']);
angular.module('znote.directives',  []);
angular.module('znote.filters',     []);
angular.module('znote.config',      []);

require('./config.js');

// require services
require('./services/authentication.service.js');
require('./services/notes.service.js');
require('./services/notification.service.js');
require('./services/refs.service.js');
require('./services/users.service.js');
require('./services/settings.service.js');

// require directives
require('./directives/dragnote.directive.js');
require('./directives/pagetitle.directive.js');
require('./directives/preloader.directive.js');
require('./directives/listview.directive.js');

// require controllers
require('./controllers/authentication.controller.js');
require('./controllers/notes.controller.js');
require('./controllers/main.controller.js');

// require filters
require('./filters/word.filter.js');
require('./filters/capitalize.filter.js');

window.znote = angular.module('znote', [
  'angular-loading-bar',
  'angular-spinkit',
  'angularTrix',
  'lumx',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'ui.router',
  'znote.config',
  'znote.controllers',
  'znote.directives',
  'znote.services',
  'znote.filters'
]);

/** firebaseURL, run, config and application routes */
znote
  .run(['$rootScope', '$state', '$stateParams', '$location', 'Notification', 'Authentication',
    function($rootScope, $state, $stateParams, $location, Notification, Authentication) {

      $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
          Notification.notify('error', 'Please Login And Try again... (ツ)');
          $state.go("login");
        }
      });

      $rootScope.$on('$stateChangeStart', function (event, toState) {
          var requireLogin = toState.data.requireLogin;
          var isLoggedIn = Authentication.isLoggedIn();

          if (requireLogin && isLoggedIn === true) {
            // Set reference to access them from any scope
            $rootScope.currentUser = Authentication.authenticatedUser();
            $rootScope.$stateParams = $stateParams;
            $rootScope.isLoggedIn = isLoggedIn;

            $location.path('/notes');
          }
      });
  }])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', 'cfpLoadingBarProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, cfpLoadingBarProvider) {
      // uncomment to enable dev logging in the app
      $logProvider.debugEnabled && $logProvider.debugEnabled(true);

      /* Angular loading bar configuration */
      cfpLoadingBarProvider.includeSpinner = false;
      cfpLoadingBarProvider.parentSelector = '.znote_navcontainer';

      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/404/notfound');

      $stateProvider
        .state('404', {
          url: '/404/notfound',
          templateUrl: 'views/404.partial.html',
          data: {
            title: '404 - Not Found'
          }
        })
        .state('login', {
          url: '/',
          templateUrl : 'views/login.partial.html',
          controller: 'AuthenticationController',
          controllerAs: 'vm',
          data: {
            title: 'Login',
            requireLogin: false
          }
        })
        .state('notes', {
          url: '/notes',
          views: {
            '': {
              templateUrl: 'views/nav.partial.html',
              controller: 'MainController',
              controllerAs: 'vm',
            },
            'theView@notes': {
              templateUrl: 'views/notes.partial.html',
              controller: 'NotesController',
              controllerAs: 'vm'
            }
          },
          data: {
            title: 'Notes',
            requireLogin: true
          },
          resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ['$firebaseAuth', 'Refs', function($firebaseAuth, Refs) {
              // $requireAuth returns a promise so the resolve waits for it to complete
              // If the promise is rejected, it will throw a $stateChangeError (see above)
              var Auth = $firebaseAuth(Refs.root);
              return Auth.$requireAuth();
            }],
            "isLoggedIn": ['Authentication', function(Authentication) {
              return Authentication.isLoggedIn();
            }]
          }
//           resolve: {
//             // controller will not be loaded until $waitForAuth resolves
//             // Auth refers to our $firebaseAuth wrapper in the example above
//             "currentAuth": ['$firebaseAuth', function($firebaseAuth) {
//               // $waitForAuth returns a promise so the resolve waits for it to complete
//               var ref = new Firebase(fbURL);
//               var authObj = $firebaseAuth(ref);
//
//               console.log(authObj.$waitForAuth());
//             }]

//           }
      })
      .state('note', {
        url: '/notes/:id?title',
        views: {
          '': {
            templateUrl: 'views/nav.partial.html',
            controller: 'MainController',
            controllerAs: 'vm',
          },
          'theView@notes': {
            templateUrl: 'views/notes.partial.html',
            controller: 'NotesController',
            controllerAs: 'vm'
          }
        },
        data: {
          requireLogin: true
        }
      })
  }]);