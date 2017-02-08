(function() {
  /**
  *  Znote module : Main module
  *
  *  Setter :
  *  This is the main application module that other dependencies are injected
  */
  angular
    .module('znote', [
      'lumx',
      'firebase',
      'ui.bootstrap',
      'znote.controllers',
      'znote.directives',
      'znote.services',
      'angular-spinkit',
      'ui.router',
      'ngCookies'
    ])
    .constant('firebaseURL', 'https://znote.firebaseio.com/')
    .config([
      '$stateProvider',
      '$urlRouterProvider',
      '$locationProvider',
      'firebaseURL',
      function($stateProvider, $urlRouterProvider, $locationProvider, firebaseURL) {
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
        $locationProvider.html5Mode(true);
      }]);
    
})();
