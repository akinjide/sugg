"use strict";


/**
  * firebaseURL, run, config and application routes
  */

// define all modules
angular.module('sugg.services', ['firebase', 'lumx']);
angular.module('sugg.controllers', ['ngStorage', 'cfp.loadingBar']);
angular.module('sugg.directives', []);
angular.module('sugg.filters', []);
angular.module('sugg.config', []);

require('./config.js');

// require services; directives; controllers; filters
require('./services/authentication.service.js');
require('./services/notes.service.js');
require('./services/notification.service.js');
require('./services/refs.service.js');
require('./services/users.service.js');
require('./services/settings.service.js');
require('./services/response.service.js');
require('./services/labels.service.js');

require('./directives/dragnote.directive.js');
require('./directives/pagetitle.directive.js');
require('./directives/preloader.directive.js');
require('./directives/slideToggle.directive.js');
require('./directives/masonry.directive.js');
require('./directives/contenteditable.directive.js');
require('./directives/texttruncate.directive.js');

require('./controllers/authentication.controller.js');
require('./controllers/notes.controller.js');
require('./controllers/main.controller.js');
require('./controllers/profile.controller.js');
require('./controllers/share.controller.js');

require('./filters/word.filter.js');
require('./filters/capitalize.filter.js');

window.sugg = angular.module('sugg', [
  'angular-clipboard',
  'angular-loading-bar',
  'angular-spinkit',
  'angularTrix',
  'lumx',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'ui.router',
  'sugg.config',
  'sugg.controllers',
  'sugg.directives',
  'sugg.services',
  'sugg.filters'
]);

sugg
  .run(['$rootScope', '$transitions', '$state', '$stateParams', '$location', 'Notification', 'Authentication', 'Response',
    function($rootScope, $transitions, $state, $stateParams, $location, Notification, Authentication, Response) {
//       $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
//         // We can catch the error thrown when the $requireAuth promise is rejected
//         // and redirect the user back to the home page
//         if (error === "AUTH_REQUIRED") {
//           Notification.notify('error', Response.warn['auth.required']);
//           $state.go("login");
//         }
//       });


      $transitions.onError({}, function(trans) {
        var $state = trans.router.stateService;
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (trans.error().detail === 'AUTH_REQUIRED') {
          Notification.notify('error', Response.warn['auth.required']);
          $state.go('login');
        }
      });

      $transitions.onStart({}, function() {
        var isLoggedIn = Authentication.isLoggedIn();
        var loggedin = Authentication.authenticatedUser();

        if (isLoggedIn && loggedin && !Boolean(loggedin.is_active)) {
          Authentication.logout();
          $state.go('login');
          Notification.notify('error', Response.error['auth.deactivated']);
        }
      });

      $transitions.onSuccess({}, function(trans) {
        var requireLogin = trans.to().data.requireLogin;
        var isLoggedIn = Authentication.isLoggedIn();
        var loggedin = Authentication.authenticatedUser();

        if (requireLogin && isLoggedIn) {
          $rootScope.isLoggedIn = isLoggedIn;
          $rootScope.$stateParams = trans.to();
        }

        if (!requireLogin && isLoggedIn) {
          $location.path('/notes');
        }

        if (loggedin && !Boolean(loggedin.is_active)) {
          $location.path('/');
        }
      });
//
//       $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
//           var requireLogin = toState.data.requireLogin;
//           var isLoggedIn = Authentication.isLoggedIn();
//
//           if (!requireLogin && isLoggedIn === true) {
//             // Set reference to access them from any scope
//             $rootScope.currentUser = Authentication.authenticatedUser();
//             $rootScope.$stateParams = $stateParams;
//             $rootScope.isLoggedIn = isLoggedIn;
//             $location.path('/notes');
//           }
//       });
  }])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', '$provide', 'cfpLoadingBarProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $provide, cfpLoadingBarProvider) {

      // comment to disable dev logging in the app
      $logProvider.debugEnabled && $logProvider.debugEnabled(true);

      // Angular loading bar configuration
      cfpLoadingBarProvider.includeSpinner = false;
      cfpLoadingBarProvider.parentSelector = '.sugg_navcontainer';

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
            $window.open('http://stackoverflow.com/search?q=[js] + ' + errorData.exception.message);
         };
      }]);

      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/404/notfound');

      $stateProvider
        .state('404', {
          url: '/404/notfound',
          templateUrl: '404.html',
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
        .state('share', {
          url: '/note/d/:note_id?uid&meta_id&shared=true',
          templateUrl : 'views/share.partial.html',
          controller: 'ShareController',
          controllerAs: 'vm',
          data: {
            title: 'Shared Note',
            requireLogin: false
          },
          onEnter: ['$transition$', '$state$', function($transition$, $state$) {
            $state$.data.title = 'Shared ' + $transition$.params('to').note_id + ' Note';
          }],
          resolve: {
            shareNote: ['$transition$', '$q', '$state', 'Note', function($transition$, $q, $state, Note) {
              var params = $transition$.params('to');

              if (!(params.uid && params.note_id && params.meta_id)) {
                $state.go('404');
                return;
              }

              var promises = [
                Note.findNote(params.note_id),
                Note.findMetadata(params.uid, params.meta_id)
              ];

              return $q.all(promises)
                .then(function(response) {
                  return response;
                })
                .catch(function() {
                  $state.go('404');
                });
            }]
          }
        })
        .state('notes', {
          url: '/notes',
          views: {
            $default: {
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
            // Auth refers to our $firebaseAuth wrapper above
            'currentAuth': ['$firebaseAuth', 'Refs', function($firebaseAuth, Refs) {
              // $requireAuth returns a promise so the resolve waits for it to complete
              // If the promise is rejected, it will throw a $stateChangeError (see above)
              var Auth = $firebaseAuth(Refs.root);
              return Auth.$requireAuth();
            }],
            'isLoggedIn': ['Authentication', function(Authentication) {
              return Authentication.isLoggedIn();
            }]
          }
      })
      .state('profile', {
        url: '/profile/:uid?name',
        views: {
          $default: {
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
          'currentAuth': ['$firebaseAuth', 'Refs', function($firebaseAuth, Refs) {
            var Auth = $firebaseAuth(Refs.root);
            return Auth.$requireAuth();
          }],
          'isLoggedIn': ['Authentication', function(Authentication) {
            return Authentication.isLoggedIn();
          }]
        },
        onEnter: ['$transition$', '$state$', function($transition$, $state$) {
          $state$.data.title = $transition$.params('to').name + ' Profile';
        }]
      });
  }])
  .provider('exceptionHandler', function exceptionHandlerProvider() {
      /**
       * Must configure the exception handling
       */

      this.config = {
        appErrorPrefix: '[sugg Error] '
      };

      this.configure = function(appErrorPrefix) {
        this.config.appErrorPrefix = appErrorPrefix;
      };

      this.$get = function() {
        return { config: this.config };
      };
  });