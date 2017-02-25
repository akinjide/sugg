angular.module('znote.directives')
  .directive('routeTitle', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
      return {
        link: function(scope, element) {
          var listener = function(event, toState) {
            var title = 'Znote | Welcome';

            if (toState.data && toState.data.pageTitle)
              title = toState.data.pageTitle;

            $timeout(function() {
              element.text(title);
            }, 0, false);

          };

          $rootScope.$on('$stateChangeSuccess', listener);
        }
      };
    }
]);