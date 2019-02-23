'use strict'

/** firebase, run, config and application routes */

// define all modules
angular.module('sugg.services', ['firebase', 'lumx'])
angular.module('sugg.controllers', ['ngStorage', 'cfp.loadingBar'])
angular.module('sugg.directives', [])
angular.module('sugg.filters', [])
angular.module('sugg.config', [])

require('./config.js')

// require services directives controllers filters
require('./services/authentication.service.js')
require('./services/notes.service.js')
require('./services/notification.service.js')
require('./services/refs.service.js')
require('./services/users.service.js')
require('./services/settings.service.js')
require('./services/response.service.js')
require('./services/tags.service.js')
require('./services/storage.service.js')

require('./directives/pagetitle.directive.js')
require('./directives/preloader.directive.js')
require('./directives/slideToggle.directive.js')
require('./directives/contenteditable.directive.js')

require('./controllers/authentication.controller.js')
require('./controllers/notes.controller.js')
require('./controllers/main.controller.js')
require('./controllers/profile.controller.js')
require('./controllers/share.controller.js')

require('./filters/word.filter.js')
require('./filters/capitalize.filter.js')
require('./filters/tag.filter.js')
require('./filters/initials.filter.js')
require('./filters/cut.filter.js')

window.sugg = angular.module('sugg', [
  'angular-clipboard',
  'angular-loading-bar',
  'angularTrix',
  'lumx',
  'ngFileUpload',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'ui.router',
  'sugg.config',
  'sugg.controllers',
  'sugg.directives',
  'sugg.services',
  'sugg.filters'
])

sugg
  .run(['$rootScope', '$transitions', '$location', 'Notification', 'Authentication', 'Response',
    function ($rootScope, $transitions, $location, Notification, Authentication, Response) {
      $transitions.onError({}, function (trans) {
        var $state = trans.router.stateService
        // We can catch the error thrown when the $requireSignIn promise is rejected
        // and redirect the user back to the home page
        if (trans.error().detail === 'AUTH_REQUIRED') {
          Notification.notify('error', Response.warn['auth.required'])
          $state.go('login')
        }
      })

      $transitions.onStart({}, function (trans) {
        var $state = trans.router.stateService
        var isLoggedIn = Authentication.isLoggedIn()
        var loggedin = Authentication.authenticatedUser()

        if (isLoggedIn && (loggedin && !loggedin.is_active)) {
          Authentication.logout()
          $state.go('login')
          Notification.notify('error', Response.error['auth.deactivated'])
        }
      })

      $transitions.onSuccess({}, function (trans) {
        var requireLogin = trans.to().data.requireLogin
        var isLoggedIn = Authentication.isLoggedIn()
        var loggedin = Authentication.authenticatedUser()

        if (requireLogin && isLoggedIn) {
          $rootScope.isLoggedIn = isLoggedIn
          $rootScope.$stateParams = trans.to()
        }

        if (!requireLogin && isLoggedIn) {
          $location.path('/notes')
        }

        if (loggedin && !loggedin.is_active) {
          $location.path('/')
        }
      })
    }
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', '$provide', 'cfpLoadingBarProvider', 'SUGG_KEYS',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $provide, cfpLoadingBarProvider, SUGG_KEYS) {
      firebase.initializeApp(JSON.parse(window.atob(SUGG_KEYS.f.join(''))))

      // comment to disable dev logging in the app
      $logProvider.debugEnabled && $logProvider.debugEnabled(true)

      // Angular loading bar configuration
      cfpLoadingBarProvider.includeSpinner = false
      cfpLoadingBarProvider.parentSelector = '.sugg_navcontainer'

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
        function extendExceptionHandler ($delegate, $window, exceptionHandler) {
          return function (exception, cause) {
            var appErrorPrefix = exceptionHandler.config.appErrorPrefix || ''
            var errorData = { exception: exception, cause: cause }

            exception.message = appErrorPrefix + exception.message
            $delegate(exception, cause)

            /**
             * Could add the error to a service's collection,
             * add errors to $rootScope, log errors to remote web server,
             * or log locally. Or throw hard. It is entirely up to you.
             * throw exception
             *
             * @example
             *     throw { message: 'error message we added' }
             */
            console.log(errorData)
            // $window.open('http://stackoverflow.com/search?q=[js] + ' + errorData.exception.message)
          }
        }
      ])

      $locationProvider.html5Mode(true)
      $urlRouterProvider.otherwise('/404/notfound')

      $stateProvider
        .state('404', {
          url: '/404/notfound',
          templateUrl: '404.html',
          data: {
            title: '404 — Not Found',
            requireLogin: false
          }
        })
        .state('legal', {
          url: '/legal',
          templateUrl: 'views/legal.partial.html',
          data: {
            title: 'Legal',
            requireLogin: false
          }
        })
        .state('login', {
          url: '/',
          templateUrl: 'views/login.partial.html',
          controller: 'AuthenticationController',
          controllerAs: 'vm',
          data: {
            title: 'Login',
            requireLogin: false
          }
        })
        .state('share', {
          url: '/note/d/:note_id?uid&meta_id&shared',
          templateUrl: 'views/share.partial.html',
          controller: 'ShareController',
          controllerAs: 'vm',
          data: {
            title: 'Shared Note',
            requireLogin: false
          },
          onEnter: ['$transition$', '$state$', function ($transition$, $state$) {
            $state$.data.title = 'Shared Note — ' + $transition$.params('to').note_id
          }],
          resolve: {
            'shareNote': ['$transition$', '$q', '$state', 'Note', function ($transition$, $q, $state, Note) {
              var params = $transition$.params('to')

              if (!(params.uid && params.note_id && params.meta_id)) {
                return $state.go('404')
              }

              return $q
                .all([
                  Note.findNote(params.note_id),
                  Note.findMetadata(params.uid, params.meta_id)
                ])
                .catch(function () {
                  $state.go('404')
                })
            }]
          }
        })
        .state('notes', {
          url: '/notes',
          views: {
            $default: {
              templateUrl: 'views/nav.partial.html',
              controller: 'MainController',
              controllerAs: 'vm'
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
            // controller will not be loaded until $requireSignIn resolves
            'currentAuth': ['$firebaseAuth', function ($firebaseAuth) {
              // $requireSignIn returns a promise so the resolve waits for it to complete
              // If the promise is rejected, it will throw a $stateChangeError (see above)
              return $firebaseAuth().$requireSignIn()
            }],
            'isLoggedIn': ['Authentication', function (Authentication) {
              return Authentication.isLoggedIn()
            }],
            'sharedWithMe': ['User', 'Authentication', 'Note', '$q', 'currentAuth', function (User, Authentication, Note, $q, currentAuth) {
              var user = Authentication.authenticatedUser()
              var shares = user && user.shared_with_me && Object.keys(user.shared_with_me)

              if (shares && shares.length > 0) {
                return $q
                  .all(shares.map(function (shareId) {
                    var share = user.shared_with_me[shareId]

                    return $q
                      .all([
                        Note.findNote(share.note_id),
                        Note.findMetadata(share.shared_by, share.metadata_id),
                        User.find(share.shared_by)
                      ])
                      .then(function (response) {
                        var note = response[0]

                        note.metadata = response[1]
                        note.props = share
                        note.shared_by = response[2]
                        note.is_shared_with = true

                        return note
                      })
                  }))
              }

              return $q.resolve([])
            }],
            'pinned': ['Authentication', 'Note', '$q', 'currentAuth', function (Authentication, Note, $q, currentAuth) {
              var user = Authentication.authenticatedUser()
              var uid = user && user.$id

              if (uid) {
                return Note.all(uid, true)
              }

              return $q.resolve([])
            }]
          }
        })
        .state('profile', {
          url: '/profile/:uid?name',
          views: {
            $default: {
              templateUrl: 'views/nav.partial.html',
              controller: 'MainController',
              controllerAs: 'vm'
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
            'currentAuth': ['$firebaseAuth', function ($firebaseAuth) {
              return $firebaseAuth().$requireSignIn()
            }],
            'isLoggedIn': ['Authentication', function (Authentication) {
              return Authentication.isLoggedIn()
            }]
          },
          onEnter: ['$transition$', '$state$', function ($transition$, $state$) {
            $state$.data.title = $transition$.params('to').name + ' Profile'
          }]
        })
    }
  ])
  .provider('exceptionHandler', function exceptionHandlerProvider () {
    /**
     * Must configure the exception handling
     */

    this.config = {
      appErrorPrefix: '[sugg Error] '
    }

    this.configure = function (appErrorPrefix) {
      this.config.appErrorPrefix = appErrorPrefix
    }

    this.$get = function () {
      return { config: this.config }
    }
  })
