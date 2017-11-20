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
require('./directives/slideToggle.directive.js');
require('./directives/masonry.directive.js');
require('./directives/contenteditable.directive.js');

// require controllers
require('./controllers/authentication.controller.js');
require('./controllers/notes.controller.js');
require('./controllers/main.controller.js');
require('./controllers/profile.controller.js');

// require filters
require('./filters/word.filter.js');
require('./filters/capitalize.filter.js');

window.znote = angular.module('znote', [
  'angular-clipboard',
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

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
          var requireLogin = toState.data.requireLogin;
          var isLoggedIn = Authentication.isLoggedIn();

          if (requireLogin && isLoggedIn === true) {
            // Set reference to access them from any scope
            $rootScope.currentUser = Authentication.authenticatedUser();
            $rootScope.$stateParams = $stateParams;
            $rootScope.isLoggedIn = isLoggedIn;
//             $location.path('/notes');
          }
      });
  }])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', '$provide', 'cfpLoadingBarProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $provide, cfpLoadingBarProvider) {

      // comment to disable dev logging in the app
      $logProvider.debugEnabled && $logProvider.debugEnabled(true);

      /* Angular loading bar configuration */
      cfpLoadingBarProvider.includeSpinner = false;
      cfpLoadingBarProvider.parentSelector = '.znote_navcontainer';

      /**
       * Configure by setting an optional string value for appErrorPrefix.
       * Accessible via config.appErrorPrefix (via config value).
       * @param  {Object} $provide
       */
      $provide.decorator('$exceptionHandler', ['$delegate', '$window', 'exceptionHandler',
      /**
       * Extend the $exceptionHandler service to also search for error on stackoverflow.
       * @param  {Object} $delegate
       * @param  {Object} $window
       * @param  {Object} exceptionHandler
       * @param  {Object} Notification
       * @return {Function} the decorated $exceptionHandler service
       */
      function extendExceptionHandler($delegate, $window, exceptionHandler) {
         return function(exception, cause) {
            var appErrorPrefix = exceptionHandler.config.appErrorPrefix || '';
            var errorData = { exception: exception, cause: cause };

            exception.message = appErrorPrefix + exception.message;
            $delegate(exception, cause);

            /**
             * Could add the error to a service's collection,
             * add errors to $rootScope, log errors to remote web server,
             * or log locally. Or throw hard. It is entirely up to you.
             * throw exception;
             *
             * @example
             *     throw { message: 'error message we added' };
             */
            console.error(exception.message, errorData);
            $window.open('http://stackoverflow.com/search?q=[js] + ' + errorData.exception.message);
         };
      }]);

      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/404/notfound');

      $stateProvider
        .state('404', {
          url: '/404/notfound',
          templateUrl: 'views/404.html',
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
            }],
            // "currentAuth": ['$firebaseAuth', function($firebaseAuth) {
//               // $waitForAuth returns a promise so the resolve waits for it to complete
//               var ref = new Firebase(fbURL);
//               var authObj = $firebaseAuth(ref);
//
//               console.log(authObj.$waitForAuth());
//             }]
          }
      })
      .state('profile', {
        url: '/profile/:uid?name',
        views: {
          '': {
            templateUrl: 'views/nav.partial.html',
            controller: 'MainController',
            controllerAs: 'vm',
          },
          'theView@profile': {
            templateUrl: 'views/profile.partial.html',
            controller: 'ProfileController',
            controllerAs: 'vm'
          }
        },
        data: {
          title: 'Profile',
          requireLogin: true
        },
        resolve: {
          "currentAuth": ['$firebaseAuth', 'Refs', function($firebaseAuth, Refs) {
            var Auth = $firebaseAuth(Refs.root);
            return Auth.$requireAuth();
          }],
          "isLoggedIn": ['Authentication', function(Authentication) {
            return Authentication.isLoggedIn();
          }]
        },
        onEnter: function($state, $rootScope) {
          this.data.title = $rootScope.currentUser.name + ' Profile';
        }
      })
  }])
  .provider('exceptionHandler', function exceptionHandlerProvider() {
      /**
       * Must configure the exception handling
       */

      this.config = {
        appErrorPrefix: '[znote Error] '
      };

      this.configure = function(appErrorPrefix) {
        this.config.appErrorPrefix = appErrorPrefix;
      };

      this.$get = function() {
        return { config: this.config };
      };
  });